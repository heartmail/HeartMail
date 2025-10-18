# 🔧 Stripe Customer Portal Setup Guide

## 🎯 Current Status

The "Manage Billing" button is already implemented and should work! Here's what's already set up:

### ✅ **What's Already Working:**
- **API Route**: `/api/stripe/customer-portal` exists and is functional
- **Frontend Integration**: Billing settings component calls the API
- **Stripe Configuration**: Stripe client is properly configured
- **Database Integration**: Links to Supabase subscriptions table

## 🔧 **Setup Steps:**

### **Step 1: Configure Stripe Customer Portal**
Run this command to configure the customer portal in your Stripe dashboard:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### **Step 2: Enable Customer Portal in Stripe Dashboard**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings** → **Billing** → **Customer Portal**
3. **Enable the customer portal**
4. Configure the features you want to allow:
   - ✅ Update payment methods
   - ✅ View billing history
   - ✅ Cancel subscriptions
   - ✅ Update billing information

### **Step 3: Test the Integration**
1. **Login to your HeartMail account**
2. **Go to Settings** → **Billing & Subscription**
3. **Click "Manage Billing"** button
4. **Should open Stripe Customer Portal** in a modal

## 🚀 **What the Button Does:**

### **Frontend Flow:**
1. User clicks "Manage Billing" button
2. `openCustomerPortal()` function is called
3. API call to `/api/stripe/customer-portal`
4. Stripe portal URL is returned
5. Modal opens with Stripe portal iframe

### **Backend Flow:**
1. API receives user ID
2. Looks up user's Stripe customer ID from database
3. Creates Stripe billing portal session
4. Returns portal URL to frontend

## 🔍 **Troubleshooting:**

### **If Button Doesn't Work:**
1. **Check browser console** for errors
2. **Verify Stripe keys** are set in environment variables
3. **Check if user has subscription** in database
4. **Ensure Stripe customer portal is enabled**

### **Common Issues:**
- **No subscription found**: User needs to have a paid subscription
- **Stripe keys missing**: Check environment variables
- **Portal not enabled**: Enable in Stripe dashboard

## 🎉 **Expected Result:**

When working correctly, clicking "Manage Billing" should:
1. Show loading state with spinner
2. Open Stripe Customer Portal in modal
3. Allow user to manage billing, payment methods, etc.
4. Return to HeartMail after closing portal

## 📋 **Environment Variables Needed:**

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=https://heartsmail.com
```

The system is already built and should work once Stripe customer portal is enabled in your dashboard! 🚀💕
