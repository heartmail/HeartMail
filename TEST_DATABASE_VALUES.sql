-- ============================================
-- TEST SQL: Update Database Values for Testing
-- ============================================
-- Run this in Supabase SQL Editor to test if frontend displays update correctly
-- Replace 'YOUR_USER_ID' with your actual user_id from auth.users table

-- STEP 1: Get your user_id (run this first to find your user_id)
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- ============================================
-- STEP 2: Set up test data (replace YOUR_USER_ID below)
-- ============================================

-- Set your user_id here:
DO $$
DECLARE
    test_user_id uuid := 'YOUR_USER_ID'; -- REPLACE THIS WITH YOUR ACTUAL USER ID
    current_month_year text := to_char(CURRENT_DATE, 'YYYY-MM');
BEGIN

-- ============================================
-- 1. UPDATE EMAILS SENT THIS MONTH TO 1
-- ============================================
-- This will show "1" in Dashboard "Emails Sent This Month" 
-- and "1 / 300" in Billing "Emails Sent"

INSERT INTO subscription_usage (
    user_id, 
    month_year, 
    emails_sent_this_month,
    recipients_created,
    created_at,
    updated_at
) VALUES (
    test_user_id,
    current_month_year,
    1,  -- SET TO 1
    3,
    NOW(),
    NOW()
)
ON CONFLICT (user_id, month_year) 
DO UPDATE SET 
    emails_sent_this_month = 1,  -- UPDATE TO 1
    updated_at = NOW();

RAISE NOTICE 'Updated subscription_usage: emails_sent_this_month = 1';

-- ============================================
-- 2. CREATE TEST SCHEDULED EMAILS (NOT SENT)
-- ============================================
-- This will show in "Scheduled Emails" count and "Upcoming Emails"

-- First, make sure you have at least one recipient
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
    test_user_id,
    'Test',
    'Recipient',
    'test@example.com',
    true,
    'friend',
    NOW(),
    NOW()
)
ON CONFLICT (user_id, email) DO NOTHING;

-- Get the recipient_id we just created
DECLARE
    test_recipient_id uuid;
BEGIN
    SELECT id INTO test_recipient_id 
    FROM recipients 
    WHERE user_id = test_user_id 
    LIMIT 1;

    -- Insert 3 scheduled emails (not sent yet)
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
        test_user_id,
        test_recipient_id,
        'Test Email 1',
        '<p>This is a test scheduled email for tomorrow</p>',
        'Test Email Tomorrow',
        CURRENT_DATE + INTERVAL '1 day',
        '10:00:00',
        'pending',  -- NOT SENT
        'one-time',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

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
        test_user_id,
        test_recipient_id,
        'Test Email 2',
        '<p>This is a test scheduled email for 2 days from now</p>',
        'Test Email Day After Tomorrow',
        CURRENT_DATE + INTERVAL '2 days',
        '14:00:00',
        'pending',  -- NOT SENT
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
        test_user_id,
        test_recipient_id,
        'Test Email 3',
        '<p>This is a test scheduled email for next week</p>',
        'Test Email Next Week',
        CURRENT_DATE + INTERVAL '7 days',
        '09:00:00',
        'pending',  -- NOT SENT
        'one-time',
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Created 3 test scheduled emails (pending status)';

END;

-- ============================================
-- 3. OPTIONAL: Add one SENT email (for testing)
-- ============================================
-- This won't count in "Scheduled Emails" but shows in activity

DECLARE
    test_recipient_id uuid;
BEGIN
    SELECT id INTO test_recipient_id 
    FROM recipients 
    WHERE user_id = test_user_id 
    LIMIT 1;

    INSERT INTO scheduled_emails (
        user_id,
        recipient_id,
        title,
        content,
        subject,
        scheduled_date,
        scheduled_time,
        status,
        sent_at,
        frequency,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        test_recipient_id,
        'Already Sent Email',
        '<p>This email was already sent</p>',
        'Test Sent Email',
        CURRENT_DATE - INTERVAL '1 day',
        '10:00:00',
        'sent',  -- ALREADY SENT
        NOW() - INTERVAL '1 hour',
        'one-time',
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Created 1 sent email (should not appear in scheduled count)';

END;

END $$;

-- ============================================
-- STEP 3: VERIFY THE DATA
-- ============================================
-- Run these queries to confirm the values were set:

-- Check emails sent this month (should be 1)
SELECT 
    user_id, 
    month_year, 
    emails_sent_this_month,
    recipients_created 
FROM subscription_usage 
WHERE month_year = to_char(CURRENT_DATE, 'YYYY-MM')
ORDER BY updated_at DESC;

-- Check scheduled emails count (should be 3 pending, excluding sent ones)
SELECT 
    status, 
    COUNT(*) as count 
FROM scheduled_emails 
WHERE status != 'sent'
GROUP BY status;

-- Check all scheduled emails
SELECT 
    title,
    scheduled_date,
    scheduled_time,
    status,
    sent_at
FROM scheduled_emails 
ORDER BY scheduled_date ASC;

-- Check recipients count
SELECT COUNT(*) as active_recipients 
FROM recipients 
WHERE is_active = true;

-- ============================================
-- EXPECTED FRONTEND RESULTS:
-- ============================================
-- After running this SQL, you should see:
-- 
-- Dashboard "Emails Sent This Month": 1
-- Dashboard "Scheduled Emails": 3 (shows "Next: Tomorrow")
-- Dashboard "Upcoming Emails": Shows 3 emails (tomorrow, 2 days, 1 week)
-- Billing "Emails Sent": 1 / 300
-- ============================================

