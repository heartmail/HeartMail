-- Fix HeartMail Database Schema
-- Run these commands in your Supabase SQL Editor

-- 1. Add username and display_name columns to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- 3. Update existing user with username
UPDATE user_profiles 
SET username = 'phill24', display_name = 'Phill'
WHERE email = 'pearsonrhill2@gmail.com';

-- 4. Verify the changes
SELECT id, email, username, display_name, first_name, last_name 
FROM user_profiles 
LIMIT 5;
