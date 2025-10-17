-- Subscription and Billing Schema for HeartMail
-- This script adds subscription management tables

-- ==============================================
-- SUBSCRIPTION TABLES
-- ==============================================

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create subscription_usage table for tracking limits
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  recipients_count INTEGER DEFAULT 0,
  templates_used INTEGER DEFAULT 0,
  emails_sent_this_month INTEGER DEFAULT 0,
  last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create billing_history table for payment records
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  amount_paid INTEGER, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('paid', 'open', 'void', 'uncollectible')),
  invoice_url TEXT,
  hosted_invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (true);

-- Subscription usage policies
CREATE POLICY "Users can view their own usage" ON subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON subscription_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage records" ON subscription_usage
  FOR INSERT WITH CHECK (true);

-- Billing history policies
CREATE POLICY "Users can view their own billing history" ON billing_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert billing records" ON billing_history
  FOR INSERT WITH CHECK (true);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_subscription_id ON billing_history(subscription_id);

-- ==============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at (drop if exists first)
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_usage_updated_at ON subscription_usage;
CREATE TRIGGER update_subscription_usage_updated_at 
  BEFORE UPDATE ON subscription_usage 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Function to get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.stripe_customer_id,
    s.stripe_subscription_id,
    s.stripe_price_id,
    s.status,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end
  FROM subscriptions s
  WHERE s.user_id = user_uuid
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's usage limits based on subscription
CREATE OR REPLACE FUNCTION get_user_limits(user_uuid UUID)
RETURNS TABLE (
  plan_name TEXT,
  recipients_limit INTEGER,
  templates_limit INTEGER,
  emails_per_month INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN s.stripe_price_id = 'price_1SJ3gL8h6OhnnNXPXyTiD9Yo' THEN 'Family'
      WHEN s.stripe_price_id = 'price_1SJ3gO8h6OhnnNXPY430Z8DW' THEN 'Extended Family'
      ELSE 'Free'
    END as plan_name,
    CASE 
      WHEN s.stripe_price_id = 'price_1SJ3gL8h6OhnnNXPXyTiD9Yo' THEN 5
      WHEN s.stripe_price_id = 'price_1SJ3gO8h6OhnnNXPY430Z8DW' THEN -1 -- unlimited
      ELSE 1
    END as recipients_limit,
    CASE 
      WHEN s.stripe_price_id = 'price_1SJ3gL8h6OhnnNXPXyTiD9Yo' THEN -1 -- unlimited
      WHEN s.stripe_price_id = 'price_1SJ3gO8h6OhnnNXPY430Z8DW' THEN -1 -- unlimited
      ELSE 3
    END as templates_limit,
    CASE 
      WHEN s.stripe_price_id = 'price_1SJ3gL8h6OhnnNXPXyTiD9Yo' THEN 100
      WHEN s.stripe_price_id = 'price_1SJ3gO8h6OhnnNXPY430Z8DW' THEN -1 -- unlimited
      ELSE 10
    END as emails_per_month
  FROM subscriptions s
  WHERE s.user_id = user_uuid 
    AND s.status = 'active'
  UNION ALL
  SELECT 'Free', 1, 3, 10
  WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions s2 
    WHERE s2.user_id = user_uuid AND s2.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
