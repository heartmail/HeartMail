-- Update Plan Limits for HeartMail
-- This script updates the subscription system to support the new plan structure

-- Create subscription_usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  recipients_count INTEGER DEFAULT 0,
  templates_used INTEGER DEFAULT 0,
  emails_sent_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or replace the get_user_limits function
CREATE OR REPLACE FUNCTION get_user_limits(user_uuid UUID)
RETURNS TABLE(
  plan_name TEXT,
  recipients_limit INTEGER,
  templates_limit INTEGER,
  emails_per_month INTEGER
) AS $$
DECLARE
  user_plan TEXT;
  user_status TEXT;
BEGIN
  -- Get user's subscription plan and status
  SELECT s.plan, s.status INTO user_plan, user_status
  FROM subscriptions s
  WHERE s.user_id = user_uuid
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no subscription found, return free plan limits
  IF user_plan IS NULL THEN
    RETURN QUERY SELECT 
      'Free'::TEXT,
      2::INTEGER,  -- 2 recipients for Free plan
      3::INTEGER,  -- 3 basic templates
      3::INTEGER;  -- 3 emails per month
  END IF;
  
  -- Return limits based on plan
  CASE user_plan
    WHEN 'free' THEN
      RETURN QUERY SELECT 
        'Free'::TEXT,
        2::INTEGER,  -- 2 recipients
        3::INTEGER,  -- 3 basic templates
        3::INTEGER;  -- 3 emails per month
    WHEN 'family' THEN
      RETURN QUERY SELECT 
        'Family'::TEXT,
        -1::INTEGER, -- Unlimited recipients
        -1::INTEGER, -- Unlimited templates
        300::INTEGER; -- 300 emails per month
    WHEN 'extended' THEN
      RETURN QUERY SELECT 
        'Extended'::TEXT,
        -1::INTEGER, -- Unlimited recipients
        -1::INTEGER, -- Unlimited templates
        -1::INTEGER; -- Unlimited emails
    ELSE
      -- Default to free plan
      RETURN QUERY SELECT 
        'Free'::TEXT,
        2::INTEGER,
        3::INTEGER,
        3::INTEGER;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user can add recipient
CREATE OR REPLACE FUNCTION can_add_recipient(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  limit_count INTEGER;
  user_plan TEXT;
  user_status TEXT;
BEGIN
  -- Get current recipient count
  SELECT COUNT(*) INTO current_count
  FROM recipients
  WHERE user_id = user_uuid AND is_active = true;
  
  -- Get user's plan and status
  SELECT s.plan, s.status INTO user_plan, user_status
  FROM subscriptions s
  WHERE s.user_id = user_uuid
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no subscription, use free plan
  IF user_plan IS NULL THEN
    user_plan := 'free';
    user_status := 'active';
  END IF;
  
  -- Get limit based on plan
  CASE user_plan
    WHEN 'free' THEN
      limit_count := 2;
    WHEN 'family', 'extended' THEN
      limit_count := -1; -- Unlimited
    ELSE
      limit_count := 2; -- Default to free
  END CASE;
  
  -- Check if user can add more
  IF limit_count = -1 THEN
    RETURN TRUE; -- Unlimited
  END IF;
  
  RETURN current_count < limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user can send email
CREATE OR REPLACE FUNCTION can_send_email(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  limit_count INTEGER;
  user_plan TEXT;
  user_status TEXT;
BEGIN
  -- Get current email count for this month
  SELECT COALESCE(emails_sent_this_month, 0) INTO current_count
  FROM subscription_usage
  WHERE user_id = user_uuid;
  
  -- Get user's plan and status
  SELECT s.plan, s.status INTO user_plan, user_status
  FROM subscriptions s
  WHERE s.user_id = user_uuid
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no subscription, use free plan
  IF user_plan IS NULL THEN
    user_plan := 'free';
    user_status := 'active';
  END IF;
  
  -- Get limit based on plan
  CASE user_plan
    WHEN 'free' THEN
      limit_count := 3;
    WHEN 'family' THEN
      limit_count := 300;
    WHEN 'extended' THEN
      limit_count := -1; -- Unlimited
    ELSE
      limit_count := 3; -- Default to free
  END CASE;
  
  -- Check if user can send more
  IF limit_count = -1 THEN
    RETURN TRUE; -- Unlimited
  END IF;
  
  RETURN current_count < limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user has access to premium templates
CREATE OR REPLACE FUNCTION has_premium_template_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  user_status TEXT;
BEGIN
  -- Get user's plan and status
  SELECT s.plan, s.status INTO user_plan, user_status
  FROM subscriptions s
  WHERE s.user_id = user_uuid
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no subscription, use free plan
  IF user_plan IS NULL THEN
    user_plan := 'free';
    user_status := 'active';
  END IF;
  
  -- Check if user has premium access
  RETURN user_plan IN ('family', 'extended') AND user_status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user can schedule emails
CREATE OR REPLACE FUNCTION can_schedule_emails(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  user_status TEXT;
BEGIN
  -- Get user's plan and status
  SELECT s.plan, s.status INTO user_plan, user_status
  FROM subscriptions s
  WHERE s.user_id = user_uuid
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no subscription, use free plan
  IF user_plan IS NULL THEN
    user_plan := 'free';
    user_status := 'active';
  END IF;
  
  -- Only family and extended plans can schedule emails
  RETURN user_plan IN ('family', 'extended') AND user_status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Update existing subscriptions to use new plan names
UPDATE subscriptions 
SET plan = 'free' 
WHERE plan = 'Free' OR plan IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Enable RLS for subscription_usage
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_usage
CREATE POLICY "Users can view own usage" ON subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON subscription_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON subscription_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);
