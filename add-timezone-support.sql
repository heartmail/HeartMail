-- Add timezone support to HeartMail
-- Run this in your Supabase SQL Editor

-- Add timezone column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add timezone column to scheduled_emails table for storing user's timezone
ALTER TABLE scheduled_emails 
ADD COLUMN IF NOT EXISTS user_timezone TEXT DEFAULT 'UTC';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_timezone ON profiles(timezone);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_timezone ON scheduled_emails(user_timezone);

-- Update existing records to have UTC as default
UPDATE profiles SET timezone = 'UTC' WHERE timezone IS NULL;
UPDATE scheduled_emails SET user_timezone = 'UTC' WHERE user_timezone IS NULL;
