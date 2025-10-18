# 🚀 Stripe Customer Portal - Complete Setup Guide

## 🎯 **Current Status: READY TO USE!**

The "Manage Billing" button is **already fully implemented** and should work! Here's what you need to do:

## 🔧 **Setup Steps:**

### **Step 1: Enable Customer Portal in Stripe Dashboard**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings** → **Billing** → **Customer Portal**
3. Click **"Activate test link"** (for testing) or **"Go live"** (for production)
4. Configure the features you want to allow:
   - ✅ **Update payment methods**
   - ✅ **View billing history** 
   - ✅ **Cancel subscriptions**
   - ✅ **Update billing information**
   - ✅ **Download invoices**

### **Step 2: Test the Integration**
1. **Visit**: `https://heartsmail.com/api/test-stripe-portal`
2. **Should return**: `{"success": true, "message": "Stripe integration is working!"}`
3. **If error**: Check your Stripe API keys

### **Step 3: Test the Manage Billing Button**
1. **Login to HeartMail**
2. **Go to Settings** → **Billing & Subscription**
3. **Click "Manage Billing"** button
4. **Should open Stripe Customer Portal** in a modal

## 🎯 **How It Works:**

### **Frontend Flow:**
```
User clicks "Manage Billing" 
    ↓
openCustomerPortal() function called
    ↓
API call to /api/stripe/customer-portal
    ↓
Stripe portal URL returned
    ↓
Modal opens with Stripe portal iframe
```

### **Backend Flow:**
```
API receives user ID
    ↓
Looks up user's Stripe customer ID from database
    ↓
Creates Stripe billing portal session
    ↓
Returns portal URL to frontend
```

## 🔍 **Troubleshooting:**

### **If Button Shows "No subscription found":**
- User needs to have a paid subscription
- Free users can't access customer portal
- They should see "View Plans" button instead

### **If Button Shows "Unable to open billing portal":**
1. **Check Stripe API keys** in environment variables
2. **Verify customer portal is enabled** in Stripe dashboard
3. **Check browser console** for specific errors

### **If Modal Opens But Portal Doesn't Load:**
1. **Check iframe security** - Stripe portal should load in iframe
2. **Verify portal URL** is valid
3. **Check network tab** for failed requests

## 📋 **Required Environment Variables:**

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_... for production

# App Configuration  
NEXT_PUBLIC_APP_URL=https://heartsmail.com
```

## 🎉 **Expected User Experience:**

### **For Free Users:**
- See "No active subscription" message
- "View Plans" button redirects to pricing

### **For Paid Users:**
- See subscription details
- "Manage Billing" button opens Stripe portal
- Can update payment methods, view history, etc.

## 🚀 **Testing Commands:**

### **Test Stripe Connection:**
```bash
curl https://heartsmail.com/api/test-stripe-portal
```

### **Test Customer Portal (requires user with subscription):**
1. Login as user with paid subscription
2. Go to Settings → Billing
3. Click "Manage Billing"
4. Should open Stripe portal in modal

## 📊 **What Users Can Do in Portal:**

- ✅ **Update payment methods**
- ✅ **View billing history**
- ✅ **Download invoices**
- ✅ **Cancel subscription**
- ✅ **Update billing address**
- ✅ **View upcoming charges**

## 🎯 **Next Steps:**

1. **Enable customer portal** in Stripe dashboard
2. **Test with a paid subscription** user
3. **Verify all features work** as expected
4. **Go live** when ready for production

The system is **already built and ready to use** - just needs Stripe dashboard configuration! 🚀💕
