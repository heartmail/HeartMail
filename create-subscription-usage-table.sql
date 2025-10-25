-- Create subscription_usage table for HeartMail
-- Run this in your Supabase SQL Editor

-- Create the subscription_usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT, -- Temporarily nullable
  emails_sent_this_month INTEGER DEFAULT 0,
  recipients_created INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add the month_year column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_usage' AND column_name = 'month_year') THEN
        ALTER TABLE subscription_usage ADD COLUMN month_year TEXT;
    END IF;
END
$$;

-- Update existing rows to set a default month_year if it's NULL
-- This is crucial before making the column NOT NULL
UPDATE subscription_usage
SET month_year = TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM')
WHERE month_year IS NULL;

-- Now, alter the column to be NOT NULL and add the UNIQUE constraint
-- This step should only be run AFTER the UPDATE statement above
DO $$
BEGIN
    -- Add NOT NULL constraint if it doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_usage' AND column_name = 'month_year' AND is_nullable = 'YES') THEN
        ALTER TABLE subscription_usage ALTER COLUMN month_year SET NOT NULL;
    END IF;

    -- Add UNIQUE constraint if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_usage_user_id_month_year_key' AND conrelid = 'public.subscription_usage'::regclass) THEN
        ALTER TABLE subscription_usage ADD CONSTRAINT subscription_usage_user_id_month_year_key UNIQUE (user_id, month_year);
    END IF;
END
$$;

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
