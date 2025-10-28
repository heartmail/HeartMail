-- Temporarily disable the trigger to test if it's causing the issue
-- This will help isolate whether the trigger is the problem

-- Drop the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Check if trigger is gone
SELECT 
  'TRIGGER DISABLED' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
    THEN 'STILL EXISTS' 
    ELSE 'SUCCESSFULLY REMOVED' 
  END as result;

-- Test if we can create a user manually (this will help identify the real issue)
-- Note: This is just for testing - don't run this in production
-- INSERT INTO auth.users (id, email, created_at, updated_at) 
-- VALUES (gen_random_uuid(), 'test@example.com', NOW(), NOW());
