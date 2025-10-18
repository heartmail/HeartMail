-- Remove phone number columns from database
-- This script removes phone number collection from all tables

-- Remove phone column from recipients table
ALTER TABLE recipients DROP COLUMN IF EXISTS phone;

-- Remove phone column from user_profiles table (if it exists)
ALTER TABLE user_profiles DROP COLUMN IF EXISTS phone;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('recipients', 'user_profiles') 
AND column_name = 'phone';

-- This should return no rows if phone columns were successfully removed
