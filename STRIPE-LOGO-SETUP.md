# 🎨 Stripe Logo Setup Guide

## 🎯 **Setting HeartMail Logo for Stripe Products**

To set your HeartMail logo for Stripe subscription products, follow these steps:

### **Step 1: Access Stripe Dashboard**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Log in with your Stripe account credentials

### **Step 2: Navigate to Products**
1. In the left sidebar, click **"Products"** (under "Billing" section)
2. You should see your two subscription products:
   - **HeartMail Family Plan** ($9.99/month)
   - **HeartMail Extended Family Plan** ($19.99/month)

### **Step 3: Update Family Plan Logo**
1. **Click on "HeartMail Family Plan"**
2. **Click "Edit product"** button
3. **Find the "Image" field**
4. **Upload the HeartMail logo** from: `https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png`
   - You can either:
     - Download the image from the URL and upload it
     - Copy the URL and paste it directly (if Stripe supports it)
5. **Click "Save product"**

### **Step 4: Update Extended Family Plan Logo**
1. **Click on "HeartMail Extended Family Plan"**
2. **Click "Edit product"** button
3. **Find the "Image" field**
4. **Upload the same HeartMail logo**
5. **Click "Save product"**

## 🎯 **What This Achieves:**

### **✅ Checkout Pages:**
- Your HeartMail logo will appear on Stripe checkout pages
- Customers will see your branding during payment
- Professional appearance for your subscription products

### **✅ Customer Portal:**
- Logo appears in the Stripe customer portal
- Consistent branding across all Stripe-hosted pages
- Professional appearance when customers manage billing

### **✅ Email Receipts:**
- Logo may appear on Stripe-generated email receipts
- Consistent branding in all customer communications

## 🔧 **Alternative Method: Stripe CLI**

If you prefer using the Stripe CLI:

```bash
# Update Family Plan
stripe products update prod_FAMILY_PRODUCT_ID \
  --images https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png

# Update Extended Family Plan  
stripe products update prod_EXTENDED_PRODUCT_ID \
  --images https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png
```

## 🎉 **Result:**

After completing these steps:
- ✅ **Family Plan** will show HeartMail logo on checkout
- ✅ **Extended Family Plan** will show HeartMail logo on checkout
- ✅ **Customer Portal** will display your branding
- ✅ **Email receipts** will include your logo
- ✅ **Professional appearance** across all Stripe pages

## 📋 **Logo Specifications:**

- **Format**: PNG (as provided)
- **Size**: Optimized for web display
- **URL**: `https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png`
- **Accessibility**: Publicly accessible from Supabase storage

Your HeartMail logo will now appear on all Stripe-hosted pages related to your subscription products! 🚀💕
