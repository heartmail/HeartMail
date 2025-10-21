-- HeartMail Database Cleanup Commands
-- Run these commands in your Supabase SQL Editor to remove profile system

-- 1. Drop profile-related tables and columns
-- Remove username and display_name columns from user_profiles table
ALTER TABLE user_profiles DROP COLUMN IF EXISTS username;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS display_name;

-- 2. Drop any profile-related indexes
DROP INDEX IF EXISTS idx_user_profiles_username;
DROP INDEX IF EXISTS idx_profiles_username;

-- 3. Clean up any profile-related data
-- Remove any existing profile data that might cause conflicts
DELETE FROM user_profiles WHERE user_id IS NULL;

-- 4. Ensure user_profiles table has only essential columns
-- Keep: id, user_id, first_name, last_name, email, bio, avatar_url, created_at, updated_at
-- Remove: username, display_name

-- 5. Update any existing profiles to remove username references
UPDATE user_profiles 
SET first_name = COALESCE(first_name, ''),
    last_name = COALESCE(last_name, '')
WHERE first_name IS NULL OR last_name IS NULL;

-- 6. Add constraints to ensure data integrity
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- 7. Clean up any orphaned profile data
DELETE FROM user_profiles 
WHERE user_id NOT IN (
  SELECT id FROM auth.users
);

-- 8. Verify the cleanup
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 9. Check for any remaining profile-related data
SELECT COUNT(*) as total_profiles FROM user_profiles;
SELECT COUNT(*) as profiles_with_names FROM user_profiles 
WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

-- 10. Final verification - this should show only essential columns
SELECT 
  'user_profiles table structure:' as info,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'user_profiles';
