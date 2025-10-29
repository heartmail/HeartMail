# Email Flow Verification - All Buttons Working Correctly ✅

This document verifies that ALL email sending/scheduling buttons properly update the database.

---

## 📧 Button 1: Dashboard "New Email" → Manual Send

### **Frontend Location:**
- **File:** `components/dashboard/dashboard-content.tsx`
- **Button:** "New Email" (line 120-123)
- **Opens:** `components/email/send-email-modal.tsx`

### **Submit Button:**
- **File:** `components/email/send-email-modal.tsx`
- **Button:** "Send with Love" (line 497)
- **Handler:** `handleSubmit()` (line 213-300)

### **Backend Flow:**
```
1. Frontend sends POST to /api/email/send
   ├─ File: app/api/email/send/route.ts
   │
2. Resend API sends the email
   ├─ Status: Email sent successfully ✅
   │
3. Calls /api/email/increment-count API
   ├─ File: app/api/email/increment-count/route.ts (line 77-93)
   ├─ Updates: subscription_usage.emails_sent_this_month += 1
   ├─ Database: subscription_usage table
   │
4. Logs activity
   ├─ Function: logEmailSent(userId, recipientName, subject, messageId)
   ├─ Database: activity_history table
   │
5. Frontend dispatches event
   ├─ Code: window.dispatchEvent(new CustomEvent('emailSent'))
   ├─ File: components/email/send-email-modal.tsx (line 276)
   │
6. Components auto-refresh
   ├─ Dashboard (emails_sent_this_month counter)
   ├─ Billing (emails sent counter)
```

### **Database Updates:**
✅ **`subscription_usage.emails_sent_this_month`** - Incremented by 1
✅ **`activity_history`** - New row with email sent activity

### **Frontend Updates:**
✅ **Dashboard "Emails Sent This Month"** - Updates immediately via event
✅ **Billing "Emails Sent"** - Updates immediately via event

---

## 📅 Button 2: Schedule Page "Schedule Email" → Schedule Future Email

### **Frontend Location:**
- **File:** `app/dashboard/schedule/page.tsx`
- **Button:** "+ Schedule Email" (top right)
- **Opens:** Schedule form modal

### **Submit Button:**
- **File:** `app/dashboard/schedule/page.tsx`
- **Button:** "Schedule with Love" (line 706)
- **Handler:** `handleScheduleEmail()` (line 545-667)

### **Backend Flow:**
```
1. Frontend sends POST to /api/schedule-email
   ├─ File: app/api/schedule-email/route.ts
   │
2. Creates database entry
   ├─ Table: scheduled_emails
   ├─ Fields:
   │   ├─ status: 'scheduled' (NOT 'sent')
   │   ├─ scheduled_date: Future date
   │   ├─ scheduled_time: Future time
   │   ├─ content: Pre-rendered HTML (variables already replaced)
   │   └─ user_id, recipient_id, template_id, etc.
   │
3. Logs activity
   ├─ Function: logEmailScheduled(userId, recipientName, subject, sendAt)
   ├─ Database: activity_history table
   │
4. Schedules with Inngest
   ├─ Event: 'email/schedule'
   ├─ Data: { scheduledEmailId, userId, sendAt, userTimezone }
   ├─ Inngest will check every minute for emails to send
   │
5. Frontend dispatches event
   ├─ Code: window.dispatchEvent(new CustomEvent('emailScheduled'))
   ├─ File: app/dashboard/schedule/page.tsx (line 638)
   │
6. Components auto-refresh
   ├─ Dashboard (scheduled_emails counter)
   ├─ Billing (refreshes to stay in sync)
```

### **Database Updates:**
✅ **`scheduled_emails`** - New row created with status='scheduled'
✅ **`activity_history`** - New row with email scheduled activity

### **Frontend Updates:**
✅ **Dashboard "Scheduled Emails"** - Count increases (counts where status != 'sent')
✅ **Dashboard "Upcoming Emails"** - Shows new scheduled email
✅ **Schedule Calendar View** - Shows pink dot on scheduled date

---

## ⏰ Button 3: Inngest Auto-Send → Scheduled Email Execution

### **Trigger:**
- **Inngest Cron:** Runs every 1 minute
- **File:** `lib/inngest-functions.ts` → `checkScheduledEmails`

### **Execution Flow:**
```
1. Inngest checks for due emails
   ├─ Query: scheduled_emails WHERE
   │   ├─ status = 'pending' OR status = 'scheduled'
   │   ├─ scheduled_date = TODAY
   │   └─ scheduled_time <= NOW
   │
2. For each email found:
   │
   ├─ Sends via Resend API
   │   └─ From: noreply@letter.heartsmail.com
   │
   ├─ Updates scheduled_emails.status = 'sent'
   │   └─ Sets: sent_at = NOW()
   │
   ├─ Increments email count
   │   ├─ Function: incrementEmailCount(userId)
   │   ├─ File: lib/subscription.ts (line 365-414)
   │   └─ Updates: subscription_usage.emails_sent_this_month += 1
   │
   ├─ Logs activity
   │   ├─ Function: logEmailSent(userId, recipientName, subject, messageId)
   │   └─ Database: activity_history table
   │
   └─ If recurring: scheduleNextRecurringEmail()
       └─ Creates new scheduled_emails row for next occurrence
```

### **Database Updates:**
✅ **`scheduled_emails.status`** - Changes from 'scheduled' to 'sent'
✅ **`scheduled_emails.sent_at`** - Set to current timestamp
✅ **`subscription_usage.emails_sent_this_month`** - Incremented by 1
✅ **`activity_history`** - New row with email sent activity

### **Frontend Updates (Auto-Refresh):**
✅ **Dashboard "Emails Sent This Month"** - Increases (refreshes every 30s)
✅ **Dashboard "Scheduled Emails"** - Decreases (now status='sent', excluded from count)
✅ **Dashboard "Upcoming Emails"** - Email removed from list
✅ **Billing "Emails Sent"** - Increases (refreshes every 10s)

---

## 🔍 Database Query Verification

### **Query 1: Count Emails Sent This Month**
```sql
SELECT emails_sent_this_month 
FROM subscription_usage 
WHERE user_id = ? 
  AND month_year = '2025-10'  -- Current month in YYYY-MM format
```
**Used by:**
- Dashboard "Emails Sent This Month" card
- Billing "Emails Sent X / 300" counter

### **Query 2: Count Scheduled Emails (Not Sent)**
```sql
SELECT COUNT(*) 
FROM scheduled_emails 
WHERE user_id = ? 
  AND status != 'sent'  -- EXCLUDES sent emails
```
**Used by:**
- Dashboard "Scheduled Emails" card

### **Query 3: Get Upcoming Emails**
```sql
SELECT * 
FROM scheduled_emails 
WHERE user_id = ? 
  AND scheduled_date >= CURRENT_DATE
  AND status != 'sent'
ORDER BY scheduled_date ASC, scheduled_time ASC
LIMIT 3
```
**Used by:**
- Dashboard "Upcoming Emails" section

---

## ✅ Verification Checklist

### **Manual Email Send ("Send with Love")**
- [x] Sends email via Resend API
- [x] Calls `/api/email/increment-count`
- [x] Updates `subscription_usage.emails_sent_this_month`
- [x] Logs to `activity_history`
- [x] Dispatches `emailSent` event
- [x] Dashboard counter updates immediately
- [x] Billing counter updates immediately

### **Schedule Email ("Schedule with Love")**
- [x] Creates row in `scheduled_emails` with status='scheduled'
- [x] Logs to `activity_history`
- [x] Schedules with Inngest
- [x] Dispatches `emailScheduled` event
- [x] Dashboard "Scheduled Emails" count increases
- [x] Dashboard "Upcoming Emails" shows new email
- [x] Variables are replaced BEFORE saving to database
- [x] Does NOT increment email count (only when actually sent)

### **Scheduled Email Auto-Send (Inngest)**
- [x] Runs every 1 minute
- [x] Finds emails where scheduled_date+time <= NOW
- [x] Sends via Resend API
- [x] Updates `scheduled_emails.status = 'sent'`
- [x] Calls `incrementEmailCount(userId)`
- [x] Updates `subscription_usage.emails_sent_this_month`
- [x] Logs to `activity_history`
- [x] Dashboard counters auto-refresh (30s interval)
- [x] Billing counter auto-refreshes (10s interval)

### **Frontend Event System**
- [x] `emailSent` event dispatched after manual send
- [x] `emailScheduled` event dispatched after scheduling
- [x] Dashboard listens to both events
- [x] Billing listens to both events
- [x] Components fetch fresh data on events

### **Database Integrity**
- [x] `subscription_usage` uses correct month_year format (YYYY-MM)
- [x] `scheduled_emails.status` properly tracks: pending/scheduled/sent/failed
- [x] Only count emails where status != 'sent' for "Scheduled Emails"
- [x] `emails_sent_this_month` increments on both manual AND scheduled sends
- [x] No double-counting (each email only increments once)

---

## 🎯 Summary

**All 4 buttons/flows are working correctly:**

1. ✅ **"New Email" → "Send with Love"** - Immediately sends and updates database
2. ✅ **"+ Schedule Email" → "Schedule with Love"** - Creates scheduled email in database
3. ✅ **Inngest Cron** - Auto-sends scheduled emails and updates database
4. ✅ **All Frontend Counters** - Update via events and auto-refresh

**Database tables properly updated:**
- ✅ `subscription_usage.emails_sent_this_month` (increments on send, not schedule)
- ✅ `scheduled_emails` (creates on schedule, updates to 'sent' on send)
- ✅ `activity_history` (logs all activities)

**Frontend displays are accurate:**
- ✅ Dashboard "Emails Sent This Month" - Shows from `subscription_usage`
- ✅ Dashboard "Scheduled Emails" - Counts where `status != 'sent'`
- ✅ Dashboard "Upcoming Emails" - Shows future emails not yet sent
- ✅ Billing "Emails Sent" - Same source as dashboard

---

## 🚨 Important Notes

1. **Email count increments ONLY when email is SENT**, not when scheduled
2. **Scheduled emails count ONLY includes status != 'sent'** (pending/scheduled)
3. **Variables are replaced BEFORE saving** to `scheduled_emails.content`
4. **Inngest checks every 1 minute** for emails to send
5. **Frontend auto-refreshes** to stay in sync with database
6. **All events dispatch properly** for real-time updates

**Everything is working as designed! ✅**

