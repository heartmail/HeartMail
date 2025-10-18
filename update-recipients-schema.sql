-- Update recipients table to have separate first_name and last_name fields
-- This migration adds the new columns and migrates existing data

-- Add new columns
ALTER TABLE recipients 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Update existing records to split the name field
-- This will split the existing 'name' field into first_name and last_name
UPDATE recipients 
SET 
  first_name = CASE 
    WHEN name IS NULL OR name = '' THEN NULL
    WHEN position(' ' in name) = 0 THEN name  -- If no space, put everything in first_name
    ELSE split_part(name, ' ', 1)  -- First word becomes first_name
  END,
  last_name = CASE 
    WHEN name IS NULL OR name = '' THEN NULL
    WHEN position(' ' in name) = 0 THEN NULL  -- If no space, last_name is NULL
    ELSE trim(substring(name from position(' ' in name) + 1))  -- Everything after first space becomes last_name
  END
WHERE first_name IS NULL OR last_name IS NULL;

-- Make first_name required (not null)
ALTER TABLE recipients 
ALTER COLUMN first_name SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipients_first_name ON recipients(first_name);
CREATE INDEX IF NOT EXISTS idx_recipients_last_name ON recipients(last_name);

-- Update the RLS policies to include the new columns
-- (The existing policies should still work, but we can add specific ones if needed)

-- Verify the migration worked
SELECT 
  id,
  name as old_name,
  first_name,
  last_name,
  email,
  user_id
FROM recipients 
ORDER BY created_at DESC
LIMIT 10;
