-- HeartMail Remove Bio Column
-- Run these commands in your Supabase SQL Editor to remove the bio column

-- 1. Remove bio column from user_profiles table
ALTER TABLE user_profiles DROP COLUMN IF EXISTS bio;

-- 2. Verify the column has been removed
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 3. Check for any remaining bio-related data
SELECT COUNT(*) as total_profiles FROM user_profiles;
SELECT COUNT(*) as profiles_with_names FROM user_profiles 
WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

-- 4. Final verification - this should show only essential columns
SELECT 
  'user_profiles table structure after bio removal:' as info,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'user_profiles';
