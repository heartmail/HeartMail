# 💰 Create Yearly Stripe Products

## 🎯 **Yearly Pricing Strategy**

### **Current Monthly Pricing:**
- **Family Plan**: $9.99/month = $119.88/year
- **Extended Family Plan**: $19.99/month = $239.88/year

### **Proposed Yearly Pricing (20% Discount):**
- **Family Plan**: $95.99/year (save $23.89 - 20% off)
- **Extended Family Plan**: $191.99/year (save $47.89 - 20% off)

## 🔧 **Steps to Create Yearly Products in Stripe:**

### **Step 1: Access Stripe Dashboard**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** (under "Billing" section)

### **Step 2: Create Yearly Family Plan**
1. **Click "Add product"**
2. **Product Name**: "HeartMail Family Plan (Yearly)"
3. **Description**: "Yearly subscription for HeartMail Family Plan - Save 20%"
4. **Pricing Model**: "Recurring"
5. **Price**: $95.99
6. **Billing Period**: "Yearly"
7. **Click "Save product"**
8. **Copy the Price ID** (starts with `price_`)

### **Step 3: Create Yearly Extended Family Plan**
1. **Click "Add product"**
2. **Product Name**: "HeartMail Extended Family Plan (Yearly)"
3. **Description**: "Yearly subscription for HeartMail Extended Family Plan - Save 20%"
4. **Pricing Model**: "Recurring"
5. **Price**: $191.99
6. **Billing Period**: "Yearly"
7. **Click "Save product"**
8. **Copy the Price ID** (starts with `price_`)

### **Step 4: Update Environment Variables**
Add the new yearly price IDs to your `.env.local`:

```bash
# Existing monthly price IDs
STRIPE_FAMILY_PRICE_ID=price_1SJ3gL8h6OhnnNXPXyTiD9Yo
STRIPE_EXTENDED_PRICE_ID=price_1SJ3gO8h6OhnnNXPY430Z8DW

# New yearly price IDs (replace with actual IDs from Stripe)
STRIPE_FAMILY_YEARLY_PRICE_ID=price_YOUR_YEARLY_FAMILY_ID
STRIPE_EXTENDED_YEARLY_PRICE_ID=price_YOUR_YEARLY_EXTENDED_ID
```

### **Step 5: Update Frontend Code**
Replace the placeholder price IDs in `components/pricing/stripe-pricing.tsx`:

```typescript
// Replace these placeholders with actual Stripe price IDs
yearlyPriceId: 'price_YOUR_ACTUAL_YEARLY_FAMILY_ID'
yearlyPriceId: 'price_YOUR_ACTUAL_YEARLY_EXTENDED_ID'
```

## 🎯 **Expected Result:**

### **Frontend Features:**
- ✅ **Monthly/Yearly Toggle** - Users can switch between billing periods
- ✅ **Yearly Discount Display** - Shows "Save 20%" badge
- ✅ **Crossed-out Monthly Price** - Shows original monthly price when yearly is selected
- ✅ **Dynamic Pricing** - Correct price ID sent to Stripe based on selection

### **User Experience:**
- **Monthly**: $9.99/month, $19.99/month
- **Yearly**: $95.99/year, $191.99/year (with 20% savings highlighted)
- **Toggle**: Easy switching between monthly and yearly
- **Checkout**: Correct Stripe price ID used based on selection

## 🧪 **Testing:**

### **Test 1: Pricing Display**
1. **Visit pricing page**
2. **Toggle between Monthly/Yearly**
3. **Verify prices change correctly**
4. **Check savings are displayed for yearly**

### **Test 2: Checkout Flow**
1. **Select yearly billing**
2. **Click upgrade button**
3. **Complete Stripe checkout**
4. **Verify yearly subscription is created**

## 🚀 **Benefits:**

- ✅ **20% discount** encourages yearly subscriptions
- ✅ **Better cash flow** with annual payments
- ✅ **Reduced churn** with yearly commitments
- ✅ **Higher customer lifetime value**

Your yearly subscription options are ready to increase revenue and customer retention! 🚀💕
