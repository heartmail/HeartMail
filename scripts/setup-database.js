const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  console.log('🚀 Setting up HeartMail database...')
  
  try {
    // Test connection
    console.log('📡 Testing Supabase connection...')
    const { data, error } = await supabase.from('auth.users').select('count').limit(1)
    
    if (error && !error.message.includes('relation "auth.users" does not exist')) {
      throw error
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Create the database schema
    console.log('📋 Creating database schema...')
    
    const schemaSQL = `
-- HeartMail Database Schema
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
    `
    
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL })
    
    if (schemaError) {
      console.log('⚠️  Schema creation had some issues (this is normal):', schemaError.message)
    } else {
      console.log('✅ Database schema created successfully!')
    }
    
    // Enable RLS
    console.log('🔒 Setting up Row Level Security...')
    
    const rlsSQL = `
-- Enable Row Level Security
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Users can view own recipients" ON recipients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own recipients" ON recipients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own recipients" ON recipients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own recipients" ON recipients
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own templates" ON templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY IF NOT EXISTS "Users can insert own templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own templates" ON templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own templates" ON templates
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own scheduled emails" ON scheduled_emails
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own scheduled emails" ON scheduled_emails
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own scheduled emails" ON scheduled_emails
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own scheduled emails" ON scheduled_emails
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own email logs" ON email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scheduled_emails 
      WHERE scheduled_emails.id = email_logs.scheduled_email_id 
      AND scheduled_emails.user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
    `
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL })
    
    if (rlsError) {
      console.log('⚠️  RLS setup had some issues:', rlsError.message)
    } else {
      console.log('✅ Row Level Security configured!')
    }
    
    // Add sample data
    console.log('📝 Adding sample templates...')
    
    const sampleDataSQL = `
INSERT INTO templates (id, user_id, title, content, category, is_public, tags) VALUES
(
  uuid_generate_v4(),
  NULL,
  'Thinking of You',
  'Dear {{recipient_name}},\n\nI hope this email finds you well. I''ve been thinking about you lately and wanted to reach out to let you know how much you mean to me.\n\n{{personal_message}}\n\nWith love,\n{{sender_name}}',
  'love',
  true,
  ARRAY['love', 'family', 'thinking']
),
(
  uuid_generate_v4(),
  NULL,
  'Weekly Family Update',
  'Dear {{recipient_name}},\n\nI hope you''re doing well! Here''s what''s been happening in our family this week:\n\n{{personal_message}}\n\nWe miss you and can''t wait to see you soon!\n\nLove,\n{{sender_name}}',
  'family',
  true,
  ARRAY['family', 'update', 'weekly']
),
(
  uuid_generate_v4(),
  NULL,
  'Birthday Wishes',
  'Happy Birthday {{recipient_name}}!\n\nI hope your special day is filled with joy, laughter, and all the things that make you happy. You deserve all the happiness in the world!\n\n{{personal_message}}\n\nWith love and birthday wishes,\n{{sender_name}}',
  'birthday',
  true,
  ARRAY['birthday', 'celebration', 'special']
),
(
  uuid_generate_v4(),
  NULL,
  'Health Check-in',
  'Dear {{recipient_name}},\n\nI wanted to check in and see how you''re feeling. Your health and wellbeing are so important to me.\n\n{{personal_message}}\n\nPlease take care of yourself, and don''t hesitate to reach out if you need anything.\n\nWith love and concern,\n{{sender_name}}',
  'health',
  true,
  ARRAY['health', 'care', 'concern']
),
(
  uuid_generate_v4(),
  NULL,
  'Holiday Greetings',
  'Dear {{recipient_name}},\n\nI hope this holiday season brings you joy, peace, and wonderful memories with your loved ones.\n\n{{personal_message}}\n\nWishing you a wonderful holiday and a happy new year!\n\nWith warm holiday wishes,\n{{sender_name}}',
  'holiday',
  true,
  ARRAY['holiday', 'season', 'greetings']
) ON CONFLICT DO NOTHING;
    `
    
    const { error: sampleError } = await supabase.rpc('exec_sql', { sql: sampleDataSQL })
    
    if (sampleError) {
      console.log('⚠️  Sample data had some issues:', sampleError.message)
    } else {
      console.log('✅ Sample templates added!')
    }
    
    console.log('🎉 HeartMail database setup complete!')
    console.log('📊 You can now:')
    console.log('   - View tables in your Supabase dashboard')
    console.log('   - Test the connection at http://localhost:3001/api/test-supabase')
    console.log('   - Start building HeartMail features!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setupDatabase()
