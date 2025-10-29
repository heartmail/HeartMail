-- ============================================
-- SIMPLE TEST SQL (Easy Copy-Paste Version)
-- ============================================
-- 1. First, find your user_id by running this:

SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Copy your user_id from the results above
-- 3. Replace 'YOUR_USER_ID' in the queries below with your actual user_id
-- 4. Run each section one by one

-- ============================================
-- SET EMAILS SENT THIS MONTH TO 1
-- ============================================

INSERT INTO subscription_usage (
    user_id, 
    month_year, 
    emails_sent_this_month,
    recipients_created,
    created_at,
    updated_at
) VALUES (
    'YOUR_USER_ID',  -- ← REPLACE THIS
    to_char(CURRENT_DATE, 'YYYY-MM'),
    1,
    3,
    NOW(),
    NOW()
)
ON CONFLICT (user_id, month_year) 
DO UPDATE SET 
    emails_sent_this_month = 1,
    updated_at = NOW();

-- ============================================
-- CREATE A TEST RECIPIENT (if you don't have one)
-- ============================================

INSERT INTO recipients (
    user_id,
    first_name,
    last_name,
    email,
    is_active,
    relationship,
    created_at,
    updated_at
) VALUES (
    'YOUR_USER_ID',  -- ← REPLACE THIS
    'Test',
    'Person',
    'test@example.com',
    true,
    'friend',
    NOW(),
    NOW()
)
ON CONFLICT (user_id, email) DO NOTHING
RETURNING id;

-- ============================================
-- GET YOUR RECIPIENT ID
-- ============================================
-- Copy the recipient_id from the results

SELECT id, first_name, last_name, email 
FROM recipients 
WHERE user_id = 'YOUR_USER_ID'  -- ← REPLACE THIS
LIMIT 1;

-- ============================================
-- CREATE 3 SCHEDULED EMAILS (NOT SENT)
-- ============================================
-- Replace YOUR_USER_ID and YOUR_RECIPIENT_ID below

-- Email 1: Tomorrow
INSERT INTO scheduled_emails (
    user_id,
    recipient_id,
    title,
    content,
    subject,
    scheduled_date,
    scheduled_time,
    status,
    frequency,
    created_at,
    updated_at
) VALUES (
    'YOUR_USER_ID',      -- ← REPLACE THIS
    'YOUR_RECIPIENT_ID', -- ← REPLACE THIS
    'Birthday Wish',
    '<p>Happy Birthday! 🎂</p>',
    'Happy Birthday!',
    CURRENT_DATE + INTERVAL '1 day',
    '10:00:00',
    'pending',
    'one-time',
    NOW(),
    NOW()
);

-- Email 2: In 2 days
INSERT INTO scheduled_emails (
    user_id,
    recipient_id,
    title,
    content,
    subject,
    scheduled_date,
    scheduled_time,
    status,
    frequency,
    created_at,
    updated_at
) VALUES (
    'YOUR_USER_ID',      -- ← REPLACE THIS
    'YOUR_RECIPIENT_ID', -- ← REPLACE THIS
    'Weekly Check-in',
    '<p>Thinking of you! 💕</p>',
    'Thinking of You',
    CURRENT_DATE + INTERVAL '2 days',
    '14:00:00',
    'pending',
    'one-time',
    NOW(),
    NOW()
);

-- Email 3: In 1 week
INSERT INTO scheduled_emails (
    user_id,
    recipient_id,
    title,
    content,
    subject,
    scheduled_date,
    scheduled_time,
    status,
    frequency,
    created_at,
    updated_at
) VALUES (
    'YOUR_USER_ID',      -- ← REPLACE THIS
    'YOUR_RECIPIENT_ID', -- ← REPLACE THIS
    'Just Saying Hi',
    '<p>Hope you have a great week! 🌟</p>',
    'Hello!',
    CURRENT_DATE + INTERVAL '7 days',
    '09:00:00',
    'pending',
    'one-time',
    NOW(),
    NOW()
);

-- ============================================
-- VERIFY YOUR DATA
-- ============================================

-- Check emails sent (should show 1)
SELECT * FROM subscription_usage 
WHERE user_id = 'YOUR_USER_ID'  -- ← REPLACE THIS
AND month_year = to_char(CURRENT_DATE, 'YYYY-MM');

-- Check scheduled emails (should show 3)
SELECT 
    title,
    scheduled_date,
    scheduled_time,
    status
FROM scheduled_emails 
WHERE user_id = 'YOUR_USER_ID'  -- ← REPLACE THIS
ORDER BY scheduled_date ASC;

-- Count scheduled (not sent) emails
SELECT COUNT(*) as scheduled_count
FROM scheduled_emails 
WHERE user_id = 'YOUR_USER_ID'  -- ← REPLACE THIS
AND status != 'sent';

-- ============================================
-- EXPECTED RESULTS IN FRONTEND:
-- ============================================
-- Dashboard "Emails Sent This Month": 1
-- Dashboard "Scheduled Emails": 3 (Next: Tomorrow)
-- Dashboard "Upcoming Emails": 3 emails listed
-- Billing "Emails Sent": 1 / 300
-- ============================================

-- ============================================
-- TO RESET BACK TO ZERO:
-- ============================================

-- Reset email count to 0
UPDATE subscription_usage 
SET emails_sent_this_month = 0
WHERE user_id = 'YOUR_USER_ID';  -- ← REPLACE THIS

-- Delete test scheduled emails
DELETE FROM scheduled_emails 
WHERE user_id = 'YOUR_USER_ID'  -- ← REPLACE THIS
AND title IN ('Birthday Wish', 'Weekly Check-in', 'Just Saying Hi');

