# Create Yearly Prices in Stripe Dashboard

Since the live mode API key doesn't have permissions to create prices, you need to create the yearly prices manually in your Stripe Dashboard.

## Steps to Create Yearly Prices

### 1. Go to Stripe Dashboard
- Navigate to: https://dashboard.stripe.com/products
- Make sure you're in **Live mode** (not test mode)

### 2. Create Family Plan Yearly Price
- Find "HeartMail Family Plan" product
- Click on the product to edit it
- Click "Add another price"
- Set the following:
  - **Price**: $99.99
  - **Billing period**: Yearly
  - **Currency**: USD
- Click "Save"
- **Copy the Price ID** (starts with `price_`)

### 3. Create Extended Plan Yearly Price
- Find "HeartMail Extended Family Plan" product
- Click on the product to edit it
- Click "Add another price"
- Set the following:
  - **Price**: $299.99
  - **Billing period**: Yearly
  - **Currency**: USD
- Click "Save"
- **Copy the Price ID** (starts with `price_`)

### 4. Update Environment Variables
Once you have the yearly price IDs, update your production environment variables:

```bash
# Add these to your production environment (Vercel)
NEXT_PUBLIC_STRIPE_FAMILY_YEARLY_PRICE_ID=price_YOUR_FAMILY_YEARLY_ID
NEXT_PUBLIC_STRIPE_EXTENDED_YEARLY_PRICE_ID=price_YOUR_EXTENDED_YEARLY_ID
```

### 5. Current Monthly Price IDs (Already Working)
```bash
NEXT_PUBLIC_STRIPE_FAMILY_MONTHLY_PRICE_ID=price_1SJ3gL8h6OhnnNXPXyTiD9Yo
NEXT_PUBLIC_STRIPE_EXTENDED_MONTHLY_PRICE_ID=price_1SJ3gO8h6OhnnNXPY430Z8DW
```

## Expected Results
- **Monthly upgrade buttons**: Already working
- **Yearly upgrade buttons**: Will work after creating yearly prices and updating environment variables
- **No test mode fallbacks**: All prices will be live mode only

## Alternative: Use Stripe Dashboard API
If you have access to create prices via the Stripe Dashboard API, you can also use the Stripe Dashboard's "Create price" feature directly.
