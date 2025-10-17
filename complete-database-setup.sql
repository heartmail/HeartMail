-- Complete Database Setup for HeartMail
-- This script creates all necessary tables and removes all mock data dependencies

-- ==============================================
-- USER PROFILE AND SETTINGS TABLES
-- ==============================================

-- Add user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  email_delivery_confirmations BOOLEAN DEFAULT true,
  monthly_reports BOOLEAN DEFAULT false,
  weekly_reports BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  timezone TEXT DEFAULT 'America/New_York',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ==============================================
-- LETTER LIBRARY TABLES
-- ==============================================

-- Create letter_templates table
CREATE TABLE IF NOT EXISTS letter_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template_categories table
CREATE TABLE IF NOT EXISTS template_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  template_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Add RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for letter_templates
ALTER TABLE letter_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public templates" ON letter_templates
  FOR SELECT USING (is_public = true);

-- Add RLS policies for template_categories
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON template_categories
  FOR SELECT USING (true);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_letter_templates_category ON letter_templates(category);
CREATE INDEX IF NOT EXISTS idx_letter_templates_featured ON letter_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_letter_templates_public ON letter_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_letter_templates_premium ON letter_templates(is_premium);

-- ==============================================
-- AUTO-CREATION TRIGGERS
-- ==============================================

-- Create function to automatically create user profile and settings on signup
CREATE OR REPLACE FUNCTION create_user_profile_and_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles
  INSERT INTO user_profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Insert into user_settings with defaults
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile and settings on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile_and_settings();

-- ==============================================
-- SAMPLE DATA
-- ==============================================

-- Insert default categories
INSERT INTO template_categories (name, description, icon, template_count) VALUES
('Love', 'Express your love and care with heartfelt messages', 'heart', 0),
('Health', 'Support and encouragement during health challenges', 'heart-pulse', 0),
('Memories', 'Share precious family moments and stories', 'camera', 0),
('Holidays', 'Special messages for birthdays, holidays, and milestones', 'gift', 0),
('Motivation', 'Uplifting messages to brighten their day', 'star', 0),
('Premium', 'Exclusive, professionally crafted templates', 'crown', 0)
ON CONFLICT (name) DO NOTHING;

-- Insert sample templates
INSERT INTO letter_templates (title, category, description, content, is_featured, is_premium, is_public, tags) VALUES
('Weekly Check-in', 'Love', 'A warm, caring message to check in on your loved one''s week', 'Hi {name}! I hope you''re having a wonderful week. I wanted to reach out and let you know I''m thinking of you. How has your week been? I''d love to hear about what you''ve been up to. Sending you lots of love and hugs!', true, false, true, ARRAY['weekly', 'check-in', 'love']),
('Thinking of You', 'Love', 'Let them know they''re always on your mind', 'I was thinking about you today and wanted to reach out. You mean so much to me, and I hope you know how much you''re loved. I''m always here for you, no matter what. Sending you warm thoughts and love!', true, false, true, ARRAY['thinking', 'love', 'support']),
('Family Photos', 'Memories', 'Share precious family moments and stories', 'I wanted to share some recent family photos with you. Looking at these pictures reminds me of all the wonderful times we''ve shared together. Each photo tells a story of love, laughter, and precious memories. I hope they bring a smile to your face!', true, false, true, ARRAY['photos', 'memories', 'family']),
('Health & Recovery', 'Health', 'Encouraging words during health challenges', 'I hope you''re feeling better each day. I''m thinking of you and sending you strength and healing energy. You''re so strong, and I know you''ll get through this. I''m here for you every step of the way. Take care of yourself!', true, true, true, ARRAY['health', 'recovery', 'support']),
('Birthday Wishes', 'Holidays', 'Special birthday messages with personal touches', 'Happy Birthday {name}! Wishing you the happiest of birthdays filled with joy, love, and wonderful surprises. You deserve all the happiness in the world. May this new year bring you health, happiness, and countless blessings!', true, false, true, ARRAY['birthday', 'celebration', 'wishes']),
('Motivational Monday', 'Motivation', 'Start their week with inspiration and motivation', 'Good morning! I hope you have an amazing week ahead. You''re capable of incredible things, and I believe in you completely. Start this week with confidence and know that you''re loved and supported. You''ve got this!', true, true, true, ARRAY['motivation', 'monday', 'inspiration'])
ON CONFLICT DO NOTHING;

-- Update template counts
UPDATE template_categories SET template_count = (
  SELECT COUNT(*) FROM letter_templates WHERE category = template_categories.name
);

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Verify all tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'user_settings', 'letter_templates', 'template_categories')
ORDER BY tablename;

-- Verify sample data
SELECT 'Categories' as table_name, COUNT(*) as count FROM template_categories
UNION ALL
SELECT 'Templates' as table_name, COUNT(*) as count FROM letter_templates;
