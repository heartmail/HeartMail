-- Create subscription_usage table for HeartMail
-- Run this in your Supabase SQL Editor

-- Create the subscription_usage table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: YYYY-MM (e.g., 2025-01)
  emails_sent_this_month INTEGER DEFAULT 0,
  recipients_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month_year) -- One record per user per month
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_month_year ON subscription_usage(month_year);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_month ON subscription_usage(user_id, month_year);

-- Enable RLS for subscription_usage
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_usage
DROP POLICY IF EXISTS "Users can view own usage" ON subscription_usage;
CREATE POLICY "Users can view own usage" ON subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON subscription_usage;
CREATE POLICY "Users can insert own usage" ON subscription_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON subscription_usage;
CREATE POLICY "Users can update own usage" ON subscription_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create usage record for new users
CREATE OR REPLACE FUNCTION create_monthly_usage_record()
RETURNS TRIGGER AS $$
DECLARE
  current_month TEXT;
BEGIN
  -- Get current month in YYYY-MM format
  current_month := to_char(NOW(), 'YYYY-MM');
  
  -- Insert usage record for current month if it doesn't exist
  INSERT INTO subscription_usage (user_id, month_year, emails_sent_this_month, recipients_created)
  VALUES (NEW.id, current_month, 0, 0)
  ON CONFLICT (user_id, month_year) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create usage record for new users
DROP TRIGGER IF EXISTS on_user_created_usage ON auth.users;
CREATE TRIGGER on_user_created_usage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_monthly_usage_record();
