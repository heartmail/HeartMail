-- Fixed migration script to update existing data for pearsonrhill2 user
-- This script finds the user by email and updates orphaned records

-- Step 1: Find the user by email (replace with actual email)
-- Look for users with email containing 'pearsonrhill2'
SELECT id, email, created_at 
FROM auth.users 
WHERE email ILIKE '%pearsonrhill2%';

-- Step 2: Once you have the UUID from the query above, 
-- replace 'ACTUAL_USER_UUID_HERE' with the real UUID and run these updates:

-- Example: If the user's UUID is '12345678-1234-1234-1234-123456789abc'
-- Replace 'ACTUAL_USER_UUID_HERE' with that UUID

-- Update recipients table (if there are orphaned records)
UPDATE recipients 
SET user_id = 'ACTUAL_USER_UUID_HERE'
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM auth.users);

-- Update templates table (if there are orphaned records)
UPDATE templates 
SET user_id = 'ACTUAL_USER_UUID_HERE'
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM auth.users);

-- Update scheduled_emails table (if there are orphaned records)
UPDATE scheduled_emails 
SET user_id = 'ACTUAL_USER_UUID_HERE'
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM auth.users);

-- Update activity_history table (if there are orphaned records)
UPDATE activity_history 
SET user_id = 'ACTUAL_USER_UUID_HERE'
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM auth.users);

-- Verify the updates
SELECT 'recipients' as table_name, COUNT(*) as count FROM recipients WHERE user_id = 'ACTUAL_USER_UUID_HERE'
UNION ALL
SELECT 'templates' as table_name, COUNT(*) as count FROM templates WHERE user_id = 'ACTUAL_USER_UUID_HERE'
UNION ALL
SELECT 'scheduled_emails' as table_name, COUNT(*) as count FROM scheduled_emails WHERE user_id = 'ACTUAL_USER_UUID_HERE'
UNION ALL
SELECT 'activity_history' as table_name, COUNT(*) as count FROM activity_history WHERE user_id = 'ACTUAL_USER_UUID_HERE';
