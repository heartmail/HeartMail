-- HeartMail Database Cleanup and Optimization Script
-- Run this AFTER the audit script to fix issues and optimize

-- ==============================================
-- 1. CLEAN UP DUPLICATE TABLES
-- ==============================================
-- Drop the old 'profiles' table if it exists (we use 'user_profiles')
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==============================================
-- 2. ENSURE PROPER TABLE STRUCTURE
-- ==============================================
-- Create user_profiles table with optimal structure
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==============================================
-- 3. CREATE OPTIMAL INDEXES
-- ==============================================
-- Indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email) WHERE email IS NOT NULL;

-- Indexes for recipients
CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_recipients_email ON recipients(email);
CREATE INDEX IF NOT EXISTS idx_recipients_active ON recipients(user_id, is_active) WHERE is_active = true;

-- Indexes for templates
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_premium ON templates(is_premium);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public) WHERE is_public = true;

-- Indexes for scheduled_emails
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_user_id ON scheduled_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status ON scheduled_emails(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_date ON scheduled_emails(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_user_status ON scheduled_emails(user_id, status);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Indexes for subscription_usage
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_month_year ON subscription_usage(month_year);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_month ON subscription_usage(user_id, month_year);

-- Indexes for activity_history
CREATE INDEX IF NOT EXISTS idx_activity_history_user_id ON activity_history(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_history_type ON activity_history(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_history_created_at ON activity_history(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_history_user_type ON activity_history(user_id, activity_type);

-- ==============================================
-- 4. CLEAN UP ORPHANED RECORDS
-- ==============================================
-- Remove orphaned recipients
DELETE FROM recipients 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned templates
DELETE FROM templates 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned scheduled_emails
DELETE FROM scheduled_emails 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned user_profiles
DELETE FROM user_profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned subscriptions
DELETE FROM subscriptions 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned subscription_usage
DELETE FROM subscription_usage 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Remove orphaned activity_history
DELETE FROM activity_history 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- ==============================================
-- 5. REMOVE DUPLICATE DATA
-- ==============================================
-- Remove duplicate recipients (keep the latest one)
WITH ranked_recipients AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, email ORDER BY created_at DESC) as rn
  FROM recipients
)
DELETE FROM recipients 
WHERE id IN (
  SELECT id FROM ranked_recipients WHERE rn > 1
);

-- Remove duplicate templates (keep the latest one)
WITH ranked_templates AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, title ORDER BY created_at DESC) as rn
  FROM templates
)
DELETE FROM templates 
WHERE id IN (
  SELECT id FROM ranked_templates WHERE rn > 1
);

-- ==============================================
-- 6. OPTIMIZE ROW LEVEL SECURITY POLICIES
-- ==============================================
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them optimally
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can insert own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can update own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can delete own recipients" ON recipients;

DROP POLICY IF EXISTS "Users can view own templates" ON templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON templates;
DROP POLICY IF EXISTS "Users can update own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;

-- Create optimized RLS policies
-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recipients policies
CREATE POLICY "Users can view own recipients" ON recipients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipients" ON recipients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipients" ON recipients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipients" ON recipients
  FOR DELETE USING (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "Users can view own templates" ON templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (auth.uid() = user_id);

-- Scheduled emails policies
CREATE POLICY "Users can view own scheduled_emails" ON scheduled_emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled_emails" ON scheduled_emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled_emails" ON scheduled_emails
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled_emails" ON scheduled_emails
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Subscription usage policies
CREATE POLICY "Users can view own subscription_usage" ON subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription_usage" ON subscription_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription_usage" ON subscription_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================
-- 7. CREATE OPTIMIZED TRIGGERS
-- ==============================================
-- Create or replace the new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile
  INSERT INTO public.user_profiles (user_id, email, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate profile creation

  -- Insert user preferences
  INSERT INTO public.user_preferences (user_id, timezone, email_notifications, push_notifications, theme)
  VALUES (NEW.id, 'America/New_York', true, true, 'light')
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert default free subscription
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  -- Create initial subscription usage record
  INSERT INTO public.subscription_usage (user_id, month_year, emails_sent_this_month, recipients_created)
  VALUES (NEW.id, TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYY-MM'), 0, 0)
  ON CONFLICT (user_id, month_year) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- 8. ADD MISSING FOREIGN KEY CONSTRAINTS
-- ==============================================
-- Add foreign key constraints where missing
ALTER TABLE scheduled_emails 
ADD CONSTRAINT fk_scheduled_emails_recipient 
FOREIGN KEY (recipient_id) REFERENCES recipients(id) ON DELETE CASCADE;

ALTER TABLE scheduled_emails 
ADD CONSTRAINT fk_scheduled_emails_template 
FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL;

-- ==============================================
-- 9. VACUUM AND ANALYZE TABLES
-- ==============================================
-- Update table statistics for better query planning
ANALYZE user_profiles;
ANALYZE recipients;
ANALYZE templates;
ANALYZE scheduled_emails;
ANALYZE subscriptions;
ANALYZE subscription_usage;
ANALYZE user_preferences;
ANALYZE activity_history;

-- ==============================================
-- 10. FINAL VERIFICATION
-- ==============================================
-- Check final table structure
SELECT 
  'FINAL VERIFICATION' as status,
  table_name,
  pg_size_pretty(pg_total_relation_size('public.' || table_name)) as size,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY pg_total_relation_size('public.' || table_name) DESC;
