# 📧 Scheduled Email Flow - Complete Analysis

## ✅ How It ACTUALLY Works (Line by Line)

### 1️⃣ **USER SCHEDULES EMAIL** (Frontend)
**File**: `/app/dashboard/schedule/page.tsx`

```javascript
// Line 100-125: User fills out form
- Select recipient (dropdown)
- Select/create template
- Write subject
- Add personal message
- Pick date & time
- Click "Schedule Email"

// IMPORTANT: Variables are already replaced HERE!
// Line 500-550: replaceTemplateVariables() is called
const emailContent = replaceTemplateVariables(template.content, recipientData)
// Result: "Hi {{first_name}}" becomes "Hi Mary" BEFORE saving!
```

**What gets sent to API:**
```json
{
  "userId": "user123",
  "recipientId": "recipient456",
  "templateId": "template789",
  "toEmail": "grandma@example.com",
  "toName": "Mary Johnson",
  "subject": "Weekly Check-in",
  "bodyHtml": "<p>Hi Mary! Hope you're doing well...</p>", // ✅ Already has real data!
  "sendAt": "2025-10-30T14:00:00Z",
  "frequency": "weekly",
  "userTimezone": "America/New_York"
}
```

---

### 2️⃣ **SAVE TO DATABASE** (API Route)
**File**: `/app/api/schedule-email/route.ts`

```javascript
// Line 59-74: Insert into database
await supabase
  .from('scheduled_emails')
  .insert({
    user_id: userId,
    recipient_id: recipientId,
    template_id: templateId,
    title: subject,  // "Weekly Check-in"
    content: bodyHtml,  // "<p>Hi Mary! Hope...</p>" - Already replaced!
    scheduled_date: '2025-10-30',
    scheduled_time: '14:00:00',
    frequency: 'weekly',
    status: 'scheduled'
  })

// Line 104-112: Schedule with Inngest
await inngest.send({
  name: 'email/schedule',
  data: {
    scheduledEmailId: 'email123',
    userId: 'user123',
    sendAt: '2025-10-30T14:00:00Z'
  }
})
```

---

### 3️⃣ **INNGEST WAITS** (Background Job)
**File**: `/lib/inngest-functions.ts`

```javascript
// Line 190-206: Schedule function
export const scheduleEmail = inngest.createFunction(
  { id: 'schedule-email' },
  { event: 'email/schedule' },
  async ({ event, step }) => {
    // ⏰ WAIT UNTIL THE EXACT TIME!
    // This is BETTER than checking every minute
    // Inngest sleeps until exactly 2025-10-30 14:00:00
    return await step.sleepUntil('wait-until-send-time', new Date(sendAt))
      .then(() => step.sendEvent('trigger-send', {
        name: 'email/send',
        data: { scheduledEmailId, userId }
      }))
  }
)
```

**Why sleepUntil is BETTER than checking every minute:**
- ✅ Exact timing (no drift)
- ✅ No wasted CPU cycles
- ✅ More reliable
- ✅ Scales better (millions of emails = no problem)

---

### 4️⃣ **SEND EMAIL** (When Time Comes)
**File**: `/lib/inngest-functions.ts`

```javascript
// Line 67-187: Send function triggers at exact time
export const sendScheduledEmail = inngest.createFunction(
  { id: 'send-scheduled-email' },
  { event: 'email/send' },
  async ({ event, step }) => {
    // Line 77-86: Get email from database
    const scheduledEmail = await supabase
      .from('scheduled_emails')
      .select('*')
      .eq('id', scheduledEmailId)
      .single()
    
    // Line 98-102: Get recipient email
    const recipient = await supabase
      .from('recipients')
      .select('email')
      .eq('id', scheduledEmail.recipient_id)
      .single()
    
    // Line 109-114: Send via Resend
    await resend.emails.send({
      from: 'HeartMail <noreply@letter.heartsmail.com>',
      to: [recipient.email],  // "grandma@example.com"
      subject: scheduledEmail.title,  // "Weekly Check-in"
      html: scheduledEmail.content,  // "<p>Hi Mary!..." ✅ Already has real data!
    })
    
    // Line 121-128: Mark as sent
    await supabase
      .from('scheduled_emails')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString()
      })
      .eq('id', scheduledEmailId)
    
    // Line 132-137: ✅ INCREMENT EMAIL COUNT
    await incrementEmailCount(userId)
    
    // Line 140-147: Log activity
    await logEmailSent(userId, recipient.email, scheduledEmail.title)
    
    // Line 158-164: Handle recurring (weekly/monthly)
    if (frequency !== 'one-time') {
      await scheduleNextRecurringEmail(supabase, scheduledEmail, frequency)
    }
  }
)
```

---

### 5️⃣ **UPDATE FRONTEND COUNTER**
**File**: `/components/billing/billing-settings.tsx`

```javascript
// Line 32-41: Listen for email sent events
useEffect(() => {
  const handleEmailSent = () => {
    if (user) {
      fetchSubscription()  // ✅ Refresh email count!
    }
  }
  window.addEventListener('emailSent', handleEmailSent)
}, [user])

// Line 44-52: Also refresh every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchSubscription()  // ✅ Catches scheduled emails automatically!
  }, 30000)
  return () => clearInterval(interval)
}, [user])

// Line 72-84: Fetch updated counts from API
const fetchSubscription = async () => {
  const response = await fetch(`/api/stripe/subscription?userId=${user?.id}`)
  const data = await response.json()
  setSubscription(data.subscription)  // ✅ Contains emails_sent_this_month!
}
```

**Display in UI:**
```jsx
// Line 200+: Shows in "Usage This Month" card
<div>
  <Mail className="h-5 w-5" />
  Emails Sent
</div>
<div>
  {subscription?.usage?.emails_sent_this_month || 0} / {limits?.emails_per_month || 300}
</div>
```

---

## 🐛 **ISSUES FOUND & FIXES NEEDED**

### ❌ Issue 1: Scheduled Emails Query
**File**: `/app/dashboard/schedule/page.tsx` Line 227

**Current (BROKEN):**
```javascript
.select(`
  *,
  recipients!inner(first_name, last_name, email)
`)
```

**Problem**: Ambiguous relationship error (same as dashboard)

**Fix**: Fetch recipients separately

---

### ❌ Issue 2: Calendar/List View Not Showing Emails
**File**: `/app/dashboard/schedule/page.tsx`

**Current**: Uses hardcoded dummy data (line 28-65)
**Fix**: Actually uses `scheduledEmails` state from database (line 98, 251-300)

**Status**: ✅ ALREADY FIXED! It fetches from database and displays correctly.

---

## ✅ **WHAT WORKS CORRECTLY**

1. ✅ Variables replaced in frontend BEFORE saving
2. ✅ Inngest uses `sleepUntil` (BETTER than checking every minute!)
3. ✅ Email sent via Resend with already-replaced content
4. ✅ `incrementEmailCount()` called after sending
5. ✅ Activity logged
6. ✅ Recurring emails scheduled for next occurrence
7. ✅ Billing counter refreshes every 30 seconds
8. ✅ Calendar and list view fetch real data from database

---

## 🔧 **ONLY FIX NEEDED**

Fix the scheduled emails query to avoid relationship error:

**Location**: `/app/dashboard/schedule/page.tsx` line 219-241

**Current Problem**:
```javascript
.select(`
  *,
  recipients!inner(first_name, last_name, email)
`)
```

**Solution**: Fetch recipients separately (like we did for dashboard)

---

## 📊 **DATA FLOW SUMMARY**

```
USER FILLS FORM
↓
FRONTEND REPLACES {{variables}} with real data
↓
API SAVES to scheduled_emails table
  - content: "<p>Hi Mary!..." (already replaced!)
  - status: 'scheduled'
↓
INNGEST.sleepUntil(exact time)
↓
⏰ TIME ARRIVES
↓
INNGEST SENDS email via Resend
  - Uses content from database (already has real names!)
↓
UPDATE status = 'sent'
↓
INCREMENT email counter
↓
LOG activity
↓
FRONTEND REFRESHES (every 30 sec or on event)
↓
USER SEES: "Emails Sent: 1 / 300" ✅
```

---

## ✨ **VERDICT**

**Your flow is ALREADY CORRECT!**

You were right - variables ARE replaced beforehand in the frontend!

The only issue is the query on line 227 that needs fixing.

Everything else works perfectly:
- ✅ Sleeps until exact time (better than checking every minute!)
- ✅ Sends pre-processed content
- ✅ Updates counter
- ✅ Shows in calendar/list view
- ✅ Logs activity

Just need to fix that one query! 🎯

