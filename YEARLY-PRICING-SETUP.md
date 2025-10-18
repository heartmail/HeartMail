# 💰 Yearly Pricing Setup Guide

## 🎯 **What's Been Implemented:**

### **✅ Frontend Changes:**
- **Monthly/Yearly Toggle** - Beautiful toggle switch with "Save 20%" badge
- **Dynamic Pricing Display** - Shows correct prices based on selection
- **Savings Highlight** - Displays savings amount and percentage
- **Crossed-out Pricing** - Shows original monthly price when yearly is selected
- **Smart Price Selection** - Uses correct Stripe price ID based on billing period

### **✅ Pricing Structure:**
- **Family Plan**: $9.99/month → $95.99/year (Save $23.89 - 20% off)
- **Extended Family Plan**: $19.99/month → $191.99/year (Save $47.89 - 20% off)

## 🔧 **Next Steps to Complete Setup:**

### **Step 1: Create Yearly Products in Stripe**
1. **Go to Stripe Dashboard** → Products
2. **Create "HeartMail Family Plan (Yearly)"** - $95.99/year
3. **Create "HeartMail Extended Family Plan (Yearly)"** - $191.99/year
4. **Copy the Price IDs** from Stripe

### **Step 2: Update Environment Variables**
Add to your `.env.local`:
```bash
# Yearly Price IDs (replace with actual Stripe IDs)
STRIPE_FAMILY_YEARLY_PRICE_ID=price_YOUR_YEARLY_FAMILY_ID
STRIPE_EXTENDED_YEARLY_PRICE_ID=price_YOUR_YEARLY_EXTENDED_ID
```

### **Step 3: Update Frontend Code**
Replace placeholders in `components/pricing/stripe-pricing.tsx`:
```typescript
// Replace these with actual Stripe price IDs
yearlyPriceId: 'price_YOUR_ACTUAL_YEARLY_FAMILY_ID'
yearlyPriceId: 'price_YOUR_ACTUAL_YEARLY_EXTENDED_ID'
```

## 🎯 **Current Status:**

### **✅ Ready:**
- Frontend toggle and pricing display
- Dynamic price selection logic
- Beautiful UI with savings badges
- Checkout integration ready

### **⏳ Pending:**
- Stripe yearly products creation
- Environment variable updates
- Price ID replacements

## 🧪 **Test the Implementation:**

### **Test 1: UI Toggle**
1. **Visit pricing page**
2. **Click Monthly/Yearly toggle**
3. **Verify prices change**
4. **Check savings are displayed**

### **Test 2: Checkout (After Stripe Setup)**
1. **Select yearly option**
2. **Click upgrade button**
3. **Complete Stripe checkout**
4. **Verify yearly subscription**

## 🚀 **Benefits:**

- ✅ **20% discount** encourages yearly subscriptions
- ✅ **Better cash flow** with annual payments
- ✅ **Reduced churn** with yearly commitments
- ✅ **Higher customer lifetime value**
- ✅ **Professional pricing presentation**

Your yearly subscription system is ready - just needs the Stripe products created! 🚀💕
