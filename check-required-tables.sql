-- Check Required Tables for Google OAuth
-- This script verifies all required tables exist and have correct structure

-- Check if user_profiles table exists and has correct structure
SELECT 
  'USER_PROFILES TABLE CHECK' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status,
  'user_profiles' as table_name;

-- Check user_profiles columns
SELECT 
  'USER_PROFILES COLUMNS' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if user_preferences table exists
SELECT 
  'USER_PREFERENCES TABLE CHECK' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_preferences' AND table_schema = 'public') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status,
  'user_preferences' as table_name;

-- Check if subscriptions table exists
SELECT 
  'SUBSCRIPTIONS TABLE CHECK' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions' AND table_schema = 'public') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status,
  'subscriptions' as table_name;

-- Check if subscription_usage table exists
SELECT 
  'SUBSCRIPTION_USAGE TABLE CHECK' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_usage' AND table_schema = 'public') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status,
  'subscription_usage' as table_name;

-- Check if trigger exists
SELECT 
  'TRIGGER CHECK' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status,
  'on_auth_user_created' as trigger_name;

-- Check if function exists
SELECT 
  'FUNCTION CHECK' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) 
    THEN 'EXISTS' 
    ELSE 'MISSING' 
  END as status,
  'handle_new_user' as function_name;

-- Check for any existing users without profiles
SELECT 
  'ORPHANED USERS CHECK' as check_type,
  COUNT(*) as users_without_profiles
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE up.user_id IS NULL;
