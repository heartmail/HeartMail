-- Migration script to update existing data for pearsonrhill2 user
-- This script finds the user by email and updates orphaned records

-- First, let's see what user exists with email containing 'pearsonrhill2'
SELECT id, email, created_at 
FROM auth.users 
WHERE email ILIKE '%pearsonrhill2%';

-- If the user exists, we can update orphaned records
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from the query above

-- Update recipients table (if there are orphaned records)
UPDATE recipients 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM auth.users);

-- Update templates table (if there are orphaned records)
UPDATE templates 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM auth.users);

-- Update scheduled_emails table (if there are orphaned records)
UPDATE scheduled_emails 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM auth.users);

-- Update activity_history table (if there are orphaned records)
UPDATE activity_history 
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM auth.users);

-- Verify the updates
SELECT 'recipients' as table_name, COUNT(*) as count FROM recipients WHERE user_id = 'YOUR_USER_ID_HERE'
UNION ALL
SELECT 'templates' as table_name, COUNT(*) as count FROM templates WHERE user_id = 'YOUR_USER_ID_HERE'
UNION ALL
SELECT 'scheduled_emails' as table_name, COUNT(*) as count FROM scheduled_emails WHERE user_id = 'YOUR_USER_ID_HERE'
UNION ALL
SELECT 'activity_history' as table_name, COUNT(*) as count FROM activity_history WHERE user_id = 'YOUR_USER_ID_HERE';
