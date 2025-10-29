# HeartMail Database Connections Map

This document shows exactly where each frontend component gets its data from in the Supabase database.

## 📊 Database Tables Structure

### 1. `subscription_usage` Table
```sql
- id (uuid)
- user_id (uuid) → references auth.users
- month_year (text) → format: "2025-10" 
- emails_sent_this_month (integer) → THE COUNT OF EMAILS SENT
- recipients_created (integer)
- created_at (timestamp)
- updated_at (timestamp)
```
**Purpose:** Tracks monthly usage per user

### 2. `scheduled_emails` Table
```sql
- id (uuid)
- user_id (uuid) → references auth.users
- title (text)
- content (text)
- recipient_id (uuid) → references recipients
- template_id (uuid) → references templates
- scheduled_date (date)
- scheduled_time (time)
- status (text) → 'pending', 'scheduled', 'sent', 'failed'
- sent_at (timestamp)
- created_at (timestamp)
```
**Purpose:** Stores all scheduled/sent emails

### 3. `recipients` Table
```sql
- id (uuid)
- user_id (uuid) → references auth.users
- first_name (text)
- last_name (text)
- email (text)
- is_active (boolean)
- custom_variables (jsonb)
- created_at (timestamp)
```
**Purpose:** Stores recipient data

### 4. `subscriptions` Table
```sql
- id (uuid)
- user_id (uuid) → references auth.users
- plan (text) → 'free', 'family', 'extended'
- stripe_customer_id (text)
- stripe_subscription_id (text)
- stripe_price_id (text)
- status (text)
- current_period_start (timestamp)
- current_period_end (timestamp)
- cancel_at_period_end (boolean)
```
**Purpose:** Stores subscription plan data

---

## 🔗 Frontend-to-Database Connections

### Location 1: Dashboard → "Emails Sent This Month" Card

**Frontend File:** 
- `components/dashboard/dashboard-content.tsx` (line 81-86)

**Data Source:**
```typescript
// File: lib/database.ts → getDashboardStats()
supabase
  .from('subscription_usage')
  .select('emails_sent_this_month')
  .eq('user_id', userId)
  .eq('month_year', currentMonth)  // e.g., "2025-10"
  .single()
```

**Database Table:** `subscription_usage`
**Field:** `emails_sent_this_month`

**How it updates:**
- When manual email sent: `lib/subscription.ts` → `incrementEmailCount()`
- When scheduled email sent: `lib/inngest-functions.ts` → calls `incrementEmailCount()`

---

### Location 2: Dashboard → "Scheduled Emails" Card

**Frontend File:** 
- `components/dashboard/dashboard-content.tsx` (line 95-100)

**Data Source:**
```typescript
// File: lib/database.ts → getDashboardStats()
supabase
  .from('scheduled_emails')
  .select('id, status, scheduled_date, scheduled_time')
  .eq('user_id', userId)
  .neq('status', 'sent')  // EXCLUDES sent emails!
```

**Database Table:** `scheduled_emails`
**Filter:** Only counts where `status != 'sent'`

**How it updates:**
- When email scheduled: New row inserted with `status = 'pending'`
- When email sent: Status updated to `'sent'` by Inngest
- Count automatically decreases as emails are sent!

---

### Location 3: Dashboard → "Upcoming Emails" Section

**Frontend File:** 
- `components/dashboard/dashboard-content.tsx` (Upcoming Emails card)

**Data Source:**
```typescript
// File: lib/database.ts → getUpcomingEmails()
supabase
  .from('scheduled_emails')
  .select('id, title, scheduled_date, scheduled_time, status, recipient_id')
  .eq('user_id', userId)
  .gte('scheduled_date', TODAY)  // Only future emails
  .order('scheduled_date', { ascending: true })
  .limit(3)  // Shows next 3 emails
```

**Database Table:** `scheduled_emails`
**Joined with:** `recipients` table (for recipient names)

**How it updates:**
- Real-time: Uses `useDashboardData` hook that refreshes every 30 seconds
- Event-driven: Listens for `emailScheduled` custom events

---

### Location 4: Billing & Subscription → "Emails Sent" Counter

**Frontend File:** 
- `components/billing/billing-settings.tsx` (line 76-89)
- Calls API: `/api/stripe/subscription`

**Data Source:**
```typescript
// File: app/api/stripe/subscription/route.ts (line 42-47)
supabase
  .from('subscription_usage')
  .select('emails_sent_this_month')
  .eq('user_id', userId)
  .eq('month_year', currentMonth)  // e.g., "2025-10"
  .single()
```

**Database Table:** `subscription_usage`
**Field:** `emails_sent_this_month`

**How it updates:**
- Event listeners for `emailSent` and `emailScheduled` events
- Auto-refresh every 10 seconds
- Same source as Dashboard "Emails Sent This Month"

---

## 🔄 How Email Count Updates Work

### When a Manual Email is Sent:
```
1. User clicks "Send with Love" 
   → app/api/email/send/route.ts

2. Resend API sends email
   → Response OK

3. Backend calls incrementEmailCount(userId)
   → lib/subscription.ts

4. Database query:
   INSERT INTO subscription_usage (
     user_id, 
     month_year, 
     emails_sent_this_month
   ) VALUES (?, ?, 1)
   ON CONFLICT (user_id, month_year)
   DO UPDATE SET 
     emails_sent_this_month = emails_sent_this_month + 1

5. Frontend dispatches custom event:
   window.dispatchEvent(new CustomEvent('emailSent'))

6. Components listening to event auto-refresh:
   - Dashboard (dashboard-content.tsx)
   - Billing (billing-settings.tsx)
```

### When a Scheduled Email is Sent:
```
1. Inngest cron job runs every minute
   → lib/inngest-functions.ts → checkScheduledEmails

2. Finds emails where:
   - scheduled_date = TODAY
   - scheduled_time <= NOW
   - status = 'pending'

3. For each email:
   a) Sends via Resend API
   b) Updates status to 'sent' in scheduled_emails
   c) Calls incrementEmailCount(userId)
   d) Logs activity to activity_history

4. Frontend auto-refreshes:
   - Dashboard refreshes every 30s
   - Billing refreshes every 10s
```

---

## 📍 Database Access Summary

| Frontend Location | Database Table | Query Filter | Field |
|------------------|---------------|--------------|-------|
| Dashboard "Emails Sent" | `subscription_usage` | `user_id`, `month_year` | `emails_sent_this_month` |
| Dashboard "Scheduled Emails" | `scheduled_emails` | `user_id`, `status != 'sent'` | COUNT(*) |
| Dashboard "Upcoming Emails" | `scheduled_emails` | `user_id`, `scheduled_date >= TODAY` | All fields |
| Billing "Emails Sent" | `subscription_usage` | `user_id`, `month_year` | `emails_sent_this_month` |

---

## 🛠️ How to Verify Database Manually

### Check Emails Sent This Month:
```sql
SELECT emails_sent_this_month 
FROM subscription_usage 
WHERE user_id = 'YOUR_USER_ID' 
  AND month_year = '2025-10';
```

### Check Scheduled Emails (Not Sent):
```sql
SELECT COUNT(*) 
FROM scheduled_emails 
WHERE user_id = 'YOUR_USER_ID' 
  AND status != 'sent';
```

### Check All Scheduled Emails with Status:
```sql
SELECT id, title, scheduled_date, scheduled_time, status, sent_at
FROM scheduled_emails 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY scheduled_date DESC;
```

### Check Upcoming Emails:
```sql
SELECT * 
FROM scheduled_emails 
WHERE user_id = 'YOUR_USER_ID' 
  AND scheduled_date >= CURRENT_DATE
  AND status != 'sent'
ORDER BY scheduled_date ASC, scheduled_time ASC;
```

---

## ✅ Current Implementation Status

All four locations in your screenshots are correctly pointing to the database:

1. ✅ **Dashboard "Emails Sent This Month"** → `subscription_usage.emails_sent_this_month`
2. ✅ **Dashboard "Scheduled Emails"** → `scheduled_emails` (COUNT where status != 'sent')
3. ✅ **Dashboard "Upcoming Emails"** → `scheduled_emails` (future dates only)
4. ✅ **Billing "Emails Sent 0 / 300"** → `subscription_usage.emails_sent_this_month`

**All connections are properly configured and should update in real-time!**

If you're seeing "0" values, it's because:
- No emails have been sent yet this month (emails_sent_this_month = 0)
- No emails are scheduled (scheduled_emails table is empty or all sent)
- The subscription_usage row for current month hasn't been created yet (gets created on first email)

