-- ============================================
-- DELETE DUPLICATE "Birthday Wish" EMAILS
-- ============================================
-- Run this in Supabase SQL Editor to remove the duplicate emails

-- STEP 1: View all "Birthday Wish" emails to confirm which ones to delete
SELECT 
    id,
    title,
    scheduled_date,
    scheduled_time,
    status,
    user_id,
    recipient_id,
    created_at
FROM scheduled_emails 
WHERE title = 'Birthday Wish'
ORDER BY created_at DESC;

-- STEP 2: Delete ALL "Birthday Wish" emails for Oct 28, 9:47 PM
-- (This will remove both duplicates)
DELETE FROM scheduled_emails 
WHERE title = 'Birthday Wish'
  AND scheduled_date = '2025-10-28'
  AND scheduled_time = '21:47:00';

-- STEP 3: Verify they're deleted
SELECT COUNT(*) as remaining_birthday_wishes
FROM scheduled_emails 
WHERE title = 'Birthday Wish'
  AND scheduled_date = '2025-10-28';
-- Should return: 0

-- ============================================
-- ALTERNATIVE: Delete by specific IDs
-- ============================================
-- If you want to delete specific emails by their ID instead:

-- First, find the IDs:
SELECT id, title, scheduled_date, scheduled_time 
FROM scheduled_emails 
WHERE title = 'Birthday Wish'
ORDER BY created_at DESC;

-- Then delete by ID (replace with actual IDs):
-- DELETE FROM scheduled_emails WHERE id = 'PASTE_ID_HERE';
-- DELETE FROM scheduled_emails WHERE id = 'PASTE_SECOND_ID_HERE';

-- ============================================
-- CLEANUP: Remove ALL test emails (OPTIONAL)
-- ============================================
-- If you want to remove all test emails you created:

-- Remove all emails scheduled for today or past dates
DELETE FROM scheduled_emails 
WHERE scheduled_date <= CURRENT_DATE
  AND status IN ('pending', 'scheduled');

-- Or remove ALL scheduled emails (use with caution!)
-- DELETE FROM scheduled_emails WHERE status != 'sent';

-- ============================================
-- EXPECTED RESULT
-- ============================================
-- After running the delete command, you should:
-- 1. No longer see "Birthday Wish" emails in "Upcoming Emails" on Dashboard
-- 2. "Scheduled Emails" counter should decrease by 2
-- 3. Calendar should not show pink dots on Oct 28
-- ============================================

