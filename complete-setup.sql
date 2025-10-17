-- HeartMail Complete Database Setup
-- Copy and paste this entire script into your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE email_status AS ENUM ('scheduled', 'sent', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE email_frequency AS ENUM ('daily', 'weekly', 'monthly', 'one-time');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE template_category AS ENUM ('love', 'family', 'health', 'holiday', 'birthday', 'general');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Recipients table
CREATE TABLE IF NOT EXISTS recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  birthday DATE,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category template_category DEFAULT 'general',
  is_premium BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled emails table
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES recipients(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  frequency email_frequency DEFAULT 'one-time',
  status email_status DEFAULT 'scheduled',
  personal_message TEXT,
  attachments JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_email_id UUID REFERENCES scheduled_emails(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL,
  error_message TEXT,
  provider TEXT,
  provider_id TEXT
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  timezone TEXT DEFAULT 'America/New_York',
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recipients
DROP POLICY IF EXISTS "Users can view own recipients" ON recipients;
CREATE POLICY "Users can view own recipients" ON recipients
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recipients" ON recipients;
CREATE POLICY "Users can insert own recipients" ON recipients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recipients" ON recipients;
CREATE POLICY "Users can update own recipients" ON recipients
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recipients" ON recipients;
CREATE POLICY "Users can delete own recipients" ON recipients
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for templates
DROP POLICY IF EXISTS "Users can view own templates" ON templates;
CREATE POLICY "Users can view own templates" ON templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS "Users can insert own templates" ON templates;
CREATE POLICY "Users can insert own templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own templates" ON templates;
CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own templates" ON templates;
CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for scheduled emails
DROP POLICY IF EXISTS "Users can view own scheduled emails" ON scheduled_emails;
CREATE POLICY "Users can view own scheduled emails" ON scheduled_emails
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own scheduled emails" ON scheduled_emails;
CREATE POLICY "Users can insert own scheduled emails" ON scheduled_emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own scheduled emails" ON scheduled_emails;
CREATE POLICY "Users can update own scheduled emails" ON scheduled_emails
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own scheduled emails" ON scheduled_emails;
CREATE POLICY "Users can delete own scheduled emails" ON scheduled_emails
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for email logs
DROP POLICY IF EXISTS "Users can view own email logs" ON email_logs;
CREATE POLICY "Users can view own email logs" ON email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scheduled_emails 
      WHERE scheduled_emails.id = email_logs.scheduled_email_id 
      AND scheduled_emails.user_id = auth.uid()
    )
  );

-- Create RLS policies for user preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipients_user_id ON recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_user_id ON scheduled_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_date ON scheduled_emails(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status ON scheduled_emails(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_scheduled_email_id ON email_logs(scheduled_email_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_recipients_updated_at ON recipients;
CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE ON recipients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduled_emails_updated_at ON scheduled_emails;
CREATE TRIGGER update_scheduled_emails_updated_at BEFORE UPDATE ON scheduled_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add sample templates
INSERT INTO templates (id, user_id, title, content, category, is_public, tags) VALUES
(
  uuid_generate_v4(),
  NULL,
  'Thinking of You',
  'Dear {{recipient_name}},

I hope this email finds you well. I''ve been thinking about you lately and wanted to reach out to let you know how much you mean to me.

{{personal_message}}

With love,
{{sender_name}}',
  'love',
  true,
  ARRAY['love', 'family', 'thinking']
),
(
  uuid_generate_v4(),
  NULL,
  'Weekly Family Update',
  'Dear {{recipient_name}},

I hope you''re doing well! Here''s what''s been happening in our family this week:

{{personal_message}}

We miss you and can''t wait to see you soon!

Love,
{{sender_name}}',
  'family',
  true,
  ARRAY['family', 'update', 'weekly']
),
(
  uuid_generate_v4(),
  NULL,
  'Birthday Wishes',
  'Happy Birthday {{recipient_name}}!

I hope your special day is filled with joy, laughter, and all the things that make you happy. You deserve all the happiness in the world!

{{personal_message}}

With love and birthday wishes,
{{sender_name}}',
  'birthday',
  true,
  ARRAY['birthday', 'celebration', 'special']
),
(
  uuid_generate_v4(),
  NULL,
  'Health Check-in',
  'Dear {{recipient_name}},

I wanted to check in and see how you''re feeling. Your health and wellbeing are so important to me.

{{personal_message}}

Please take care of yourself, and don''t hesitate to reach out if you need anything.

With love and concern,
{{sender_name}}',
  'health',
  true,
  ARRAY['health', 'care', 'concern']
),
(
  uuid_generate_v4(),
  NULL,
  'Holiday Greetings',
  'Dear {{recipient_name}},

I hope this holiday season brings you joy, peace, and wonderful memories with your loved ones.

{{personal_message}}

Wishing you a wonderful holiday and a happy new year!

With warm holiday wishes,
{{sender_name}}',
  'holiday',
  true,
  ARRAY['holiday', 'season', 'greetings']
) ON CONFLICT DO NOTHING;

-- Success message
SELECT 'HeartMail database setup complete! 🎉' as message;
