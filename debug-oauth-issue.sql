-- Debug Google OAuth Issue
-- This script will help identify what's causing the database error

-- 1. Check if the trigger is actually firing
SELECT 
  'TRIGGER STATUS' as check_type,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check recent auth.users entries
SELECT 
  'RECENT USERS' as check_type,
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check if user_profiles table has any constraints that might be failing
SELECT 
  'USER_PROFILES CONSTRAINTS' as check_type,
  constraint_name,
  constraint_type,
  column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'user_profiles' 
  AND tc.table_schema = 'public';

-- 4. Check for any RLS policies that might be blocking inserts
SELECT 
  'RLS POLICIES' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'user_profiles'
ORDER BY policyname;

-- 5. Test if we can manually insert into user_profiles
-- This will help identify if there are any constraint violations
SELECT 
  'MANUAL INSERT TEST' as check_type,
  'Testing if manual insert works' as status;
