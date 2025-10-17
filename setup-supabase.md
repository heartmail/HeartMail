# HeartMail Supabase Setup Guide

## 🚀 Quick Setup Steps

### 1. **Get Your Service Role Key**
1. Go to your Supabase dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)
4. Replace `your_service_role_key_here` in `.env.local`

### 2. **Create Database Schema**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Click **Run** to create all tables and policies

### 3. **Add Sample Data**
1. In the **SQL Editor**, copy and paste the contents of `sample-data.sql`
2. Click **Run** to add sample templates

### 4. **Test the Connection**
Your Next.js app should now be able to connect to Supabase!

## 📋 What We've Set Up

### **Database Tables:**
- ✅ **recipients** - Store family members and loved ones
- ✅ **templates** - Email templates (personal + public)
- ✅ **scheduled_emails** - Scheduled email campaigns
- ✅ **email_logs** - Track sent emails
- ✅ **user_preferences** - User settings
- ✅ **subscriptions** - Billing information

### **Security:**
- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ **Policies** ensure users only see their own data
- ✅ **Public templates** are accessible to all users

### **Features:**
- ✅ **Real-time subscriptions** for live updates
- ✅ **Automatic timestamps** with triggers
- ✅ **Optimized indexes** for performance
- ✅ **Custom types** for data validation

## 🔧 Next Steps

1. **Update your `.env.local`** with the service role key
2. **Run the SQL scripts** in your Supabase dashboard
3. **Test the connection** by running your Next.js app
4. **Start building** the HeartMail features!

## 🆘 Need Help?

If you run into any issues:
1. Check the Supabase logs in your dashboard
2. Verify your environment variables are correct
3. Make sure RLS policies are working as expected

Your HeartMail backend is now ready to go! 💖
