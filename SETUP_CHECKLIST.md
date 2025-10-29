# 🔧 HeartMail Production Setup Checklist

## ✅ COMPLETED

- ✅ Supabase connected (project: heartmail-site)
- ✅ Authentication working (cookie-based)
- ✅ Dashboard loading correctly
- ✅ Database queries fixed (no relationship errors)
- ✅ Code cleaned up (no duplicates)
- ✅ Production build passing
- ✅ All changes pushed to GitHub

---

## ⚠️ CRITICAL: Inngest Setup Required

### Current Status:
```
INNGEST_EVENT_KEY=your_inngest_event_key_here ❌
INNGEST_SIGNING_KEY=your_inngest_signing_key_here ❌
```

### What Inngest Does:
- Schedules emails to send at exact time
- Handles recurring emails (daily/weekly/monthly)
- Ensures emails are sent reliably

### Setup Steps:

#### 1. Create Inngest Account
```bash
# Go to: https://www.inngest.com/
# Sign up with your email
```

#### 2. Create a New App
- Click "Create App" in Inngest dashboard
- Name: "HeartMail"
- Environment: Production

#### 3. Get Your Keys
- In Inngest dashboard, go to **Settings** → **Keys**
- Copy both keys:
  - **Event Key** (starts with `inngest_`)
  - **Signing Key** (starts with `signkey_`)

#### 4. Add to .env.local
```bash
INNGEST_EVENT_KEY=inngest_YOUR_ACTUAL_KEY_HERE
INNGEST_SIGNING_KEY=signkey_YOUR_ACTUAL_KEY_HERE
```

#### 5. Add to Vercel Environment Variables
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add both keys for **Production** environment

#### 6. Configure Inngest Sync URL
In Inngest Dashboard:
- Go to **Apps** → **HeartMail** → **Syncs**
- Add sync URL: `https://heartsmail.com/api/inngest`
- Click "Sync"

---

## 📊 Database Verification Needed

### Check These Tables:

#### 1. `scheduled_emails`
Should have these columns:
```sql
- id (uuid)
- user_id (uuid)
- recipient_id (uuid)
- template_id (uuid, nullable)
- title (text)
- content (text)
- scheduled_date (date)
- scheduled_time (time)
- frequency (text: 'one-time', 'daily', 'weekly', 'monthly')
- status (text: 'scheduled', 'sent', 'failed', 'cancelled')
- sent_at (timestamp, nullable)
- error_message (text, nullable)
- user_timezone (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. `subscription_usage`
Should have these columns:
```sql
- id (uuid)
- user_id (uuid)
- subscription_id (uuid, nullable)
- recipients_count (integer)
- templates_used (integer)
- emails_sent_this_month (integer) ← THIS IS KEY!
- last_reset_date (date)
- created_at (timestamp)
- updated_at (timestamp)
```

### Verify via Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/fmuhjcrbwuoisjwuvreg
2. Click **Table Editor**
3. Check both tables exist and have correct columns

---

## 🧪 Testing Checklist

### 1. Test Scheduled Email Flow

**On Production Site (heartsmail.com):**

1. **Login to Dashboard**
   - Go to https://heartsmail.com/login
   - Login with your credentials
   - Should reach dashboard ✅

2. **Create a Recipient**
   - Go to Recipients page
   - Add new recipient (e.g., test email)

3. **Schedule a Test Email**
   - Go to Schedule page
   - Click "+ Schedule Email"
   - Fill out form:
     - Select recipient
     - Choose template or write message
     - Set time: **2 minutes from now**
     - Click "Schedule"
   
4. **Verify Database Entry**
   - Check Supabase dashboard
   - `scheduled_emails` table should have new row
   - `status` should be `'scheduled'`

5. **Wait 2+ Minutes**
   - Email should send automatically
   - Check recipient's email inbox

6. **Verify Email Sent**
   - Dashboard → Schedule page
   - Email `status` should change to `'sent'`
   - Dashboard → Settings → Billing
   - "Emails Sent" counter should increment: `1 / 300`

### 2. Test Calendar View
- Go to Schedule page
- Click "Calendar" tab
- Scheduled emails should appear on correct dates
- Should show different colors for frequency types

### 3. Test List View
- Click "List" tab
- All scheduled emails should display
- Search should filter correctly
- Can view/edit/delete emails

---

## 🚀 Production Deployment Steps

### 1. Vercel Environment Variables
Make sure these are ALL set in Vercel:

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ STRIPE_SECRET_KEY
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
✅ STRIPE_FAMILY_PRICE_ID
✅ STRIPE_EXTENDED_PRICE_ID
✅ STRIPE_WEBHOOK_SECRET
✅ NEXT_PUBLIC_GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_ID
✅ GOOGLE_CLIENT_SECRET
✅ RESEND_API_KEY
✅ NEXT_PUBLIC_APP_URL
✅ NODE_ENV=production
⚠️ INNGEST_EVENT_KEY (NEED TO ADD)
⚠️ INNGEST_SIGNING_KEY (NEED TO ADD)
```

### 2. Verify Google OAuth
- Go to: https://console.cloud.google.com/apis/credentials
- Check redirect URIs include:
  - `https://fmuhjcrbwuoisjwuvreg.supabase.co/auth/v1/callback`
  - `https://heartsmail.com/auth/callback`

### 3. Verify Stripe Webhook
- Go to: https://dashboard.stripe.com/webhooks
- Endpoint: `https://heartsmail.com/api/stripe/webhook`
- Events selected:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

### 4. Deploy
```bash
git push origin main
# Vercel auto-deploys
# Wait ~2-3 minutes
```

---

## 📝 Commands You Can Run

### Check Supabase Tables
```bash
# Via Supabase Dashboard
https://supabase.com/dashboard/project/fmuhjcrbwuoisjwuvreg/editor
```

### Test Inngest Locally
```bash
# Start Inngest dev server
npx inngest-cli@latest dev

# In another terminal, start your app
npm run dev

# Schedule a test email
# It should appear in Inngest dev UI: http://localhost:8288
```

### Check Current Scheduled Emails
Can create an API endpoint or query Supabase directly via dashboard

---

## 🎯 What's Working Now

1. ✅ Login/Logout (cookie-based, no redirect issues!)
2. ✅ Dashboard loads data correctly
3. ✅ Recipients page works
4. ✅ Templates page works
5. ✅ Schedule page shows calendar and list views
6. ✅ Email counter updates (every 30 seconds)
7. ✅ All database queries optimized

## 🚧 What Needs Setup

1. ⚠️ **CRITICAL**: Inngest keys (for scheduled emails to actually send)
2. ⚠️ Test Google OAuth on production
3. ⚠️ Test Stripe checkout flow
4. ⚠️ Test scheduled email end-to-end

---

## 🆘 Need Help?

### If Inngest seems complicated:
I can help you set it up step-by-step. It's actually quite simple:
1. Create account (2 minutes)
2. Get 2 keys (1 minute)
3. Add to env vars (1 minute)
4. Test (5 minutes)

### Alternative to Inngest:
If you want to avoid Inngest for now, I can create a simple cron job version that checks every minute. But Inngest is MUCH better because:
- ✅ More reliable
- ✅ Exact timing
- ✅ Better at scale
- ✅ Free tier is generous

---

**Ready to set up Inngest?** Let me know and I'll guide you through each step! 🚀

