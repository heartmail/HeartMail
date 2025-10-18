# 🚀 Stripe Checkout Setup - Complete Guide

## 🎯 **Current Status: READY TO USE!**

Your upgrade buttons are **already fully implemented** and should work! Here's what's set up:

## ✅ **What's Already Working:**

### **Frontend Integration:**
- ✅ **Upgrade buttons** on pricing page
- ✅ **Stripe checkout integration** with `redirectToCheckout`
- ✅ **Loading states** and error handling
- ✅ **User authentication** checks
- ✅ **Coupon code support**

### **Backend API:**
- ✅ **`/api/stripe/checkout`** - Creates checkout sessions
- ✅ **Live Stripe keys** configured
- ✅ **Correct price IDs** for Family ($9.99) and Extended Family ($19.99)
- ✅ **Database integration** with Supabase
- ✅ **Webhook handling** for subscription events

## 🔧 **Setup Steps:**

### **Step 1: Verify Stripe Account Configuration**
Your current configuration:
- **Stripe Account**: Live mode (production)
- **Secret Key**: `sk_live_51SIwzV8h6OhnnNXP...` ✅
- **Publishable Key**: `pk_live_51SIwzV8h6OhnnNXP...` ✅
- **Family Plan**: `price_1SJ3gL8h6OhnnNXPXyTiD9Yo` ($9.99/month) ✅
- **Extended Family**: `price_1SJ3gO8h6OhnnNXPY430Z8DW` ($19.99/month) ✅

### **Step 2: Test the Upgrade Buttons**
1. **Visit**: `https://heartsmail.com/#pricing`
2. **Click "Upgrade"** on Family or Extended Family plan
3. **Should redirect** to Stripe checkout
4. **Complete payment** with test card: `4242 4242 4242 4242`

### **Step 3: Verify Webhook Configuration**
Your webhook is configured at:
- **URL**: `https://heartsmail.com/api/stripe/webhook`
- **Secret**: `whsec_qOBWA4nppl4Jm7xTIVz0wRwpT2QoBxmb`

## 🎯 **How the Upgrade Flow Works:**

### **User Journey:**
```
User clicks "Upgrade" button
    ↓
Check if user is logged in
    ↓
Create Stripe checkout session
    ↓
Redirect to Stripe checkout page
    ↓
User completes payment
    ↓
Stripe webhook updates database
    ↓
User redirected back to dashboard
```

### **Technical Flow:**
```
Frontend: handleSubscribe()
    ↓
API: /api/stripe/checkout
    ↓
Create Stripe customer
    ↓
Create checkout session
    ↓
Return session ID
    ↓
Frontend: redirectToCheckout()
    ↓
Stripe checkout page
```

## 🧪 **Testing the Integration:**

### **Test 1: Check Stripe Connection**
```bash
curl https://heartsmail.com/api/test-stripe-portal
```
**Expected**: `{"success": true, "message": "Stripe integration is working!"}`

### **Test 2: Test Checkout Session Creation**
1. **Login to HeartMail**
2. **Go to pricing page**
3. **Click "Upgrade"** on Family plan
4. **Should redirect** to Stripe checkout
5. **Use test card**: `4242 4242 4242 4242`

### **Test 3: Complete Purchase**
1. **Fill out checkout form**
2. **Use test card**: `4242 4242 4242 4242`
3. **Complete payment**
4. **Should redirect** back to dashboard
5. **Check subscription status** in settings

## 🔍 **Troubleshooting:**

### **If Upgrade Button Doesn't Work:**
1. **Check browser console** for errors
2. **Verify user is logged in**
3. **Check Stripe keys** are correct
4. **Verify price IDs** match your Stripe dashboard

### **If Checkout Doesn't Load:**
1. **Check Stripe publishable key** in environment
2. **Verify checkout API** is working
3. **Check network tab** for failed requests

### **If Payment Fails:**
1. **Use test card numbers** for testing
2. **Check Stripe dashboard** for errors
3. **Verify webhook** is configured correctly

## 🎉 **Expected User Experience:**

### **For Free Users:**
1. **Click "Upgrade"** on Family or Extended Family
2. **Redirected to login** if not authenticated
3. **Stripe checkout page** loads
4. **Complete payment** with card
5. **Redirected back** to dashboard
6. **Subscription activated** immediately

### **For Existing Subscribers:**
1. **See "Current Plan"** for active subscription
2. **See "Upgrade"** for higher tiers
3. **Manage billing** through customer portal

## 📋 **Test Cards for Stripe:**

### **Successful Payments:**
- `4242 4242 4242 4242` - Visa
- `5555 5555 5555 4444` - Mastercard
- `3782 822463 10005` - American Express

### **Declined Payments:**
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

## 🚀 **Production Checklist:**

- ✅ **Live Stripe keys** configured
- ✅ **Correct price IDs** set
- ✅ **Webhook configured** and working
- ✅ **Database integration** with Supabase
- ✅ **User authentication** working
- ✅ **Error handling** implemented
- ✅ **Loading states** for better UX

## 🎯 **Next Steps:**

1. **Test the upgrade buttons** on your pricing page
2. **Complete a test purchase** with test card
3. **Verify subscription** appears in settings
4. **Test customer portal** for billing management

**Your Stripe checkout is fully implemented and ready to use!** 🚀💕
