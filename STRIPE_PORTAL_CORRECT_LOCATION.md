# Correct Location for Stripe Portal Domain Configuration

You're in the right area, but you need to go to the **Customer Portal** section instead of **Custom Domains**.

## Navigate to the Correct Section

### Step 1: Go to Customer Portal Settings
1. **From where you are now**: Click on **"Settings"** in the left sidebar
2. **Then click**: **"Billing"** 
3. **Then click**: **"Customer portal"**

### Step 2: Find Your Configuration
Look for configuration ID: `bpc_1SKhbw8h6OhnnNXPTyeUFoVh`

### Step 3: Edit the Configuration
1. **Click on your configuration** to edit it
2. **Look for "Business information"** section
3. **Find "Domains"** field
4. **Add these domains**:
   - `heartsmail.com`
   - `www.heartsmail.com`
   - `localhost:3000`

### Alternative: Use Default Domains
If you can't find the domain settings, you can try using Stripe's default domains by updating your code to not specify a configuration:

```typescript
// In app/api/stripe/customer-portal/route.ts
const portalSession = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?tab=billing`,
  // Remove the configuration line to use default settings
})
```

## Current vs. Needed
- **Current**: Custom domains (what you're seeing) - for replacing Stripe domains
- **Needed**: Customer Portal configuration - for allowing your domain to embed Stripe's portal

The error occurs because Stripe's default portal doesn't allow your domain to embed it. You need to either:
1. **Configure your portal** to allow your domain, OR
2. **Use default portal settings** (remove configuration ID)
