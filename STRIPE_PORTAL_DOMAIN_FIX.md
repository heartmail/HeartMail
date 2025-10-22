# Fix Stripe Portal Domain Configuration

The error "Refused to frame 'https://billing.stripe.com/' because an ancestor violates the following Content Security Policy directive: 'frame-ancestors 'none'" indicates that the Stripe Customer Portal configuration needs to be updated to allow your domain.

## Steps to Fix

### 1. Update Stripe Portal Configuration
Go to your Stripe Dashboard and update the Customer Portal configuration:

1. **Navigate to Stripe Dashboard**: https://dashboard.stripe.com/settings/billing/portal
2. **Find your configuration**: Look for configuration ID `bpc_1SKhbw8h6OhnnNXPTyeUFoVh`
3. **Edit the configuration**:
   - Click on the configuration to edit it
   - Go to "Business information" section
   - Under "Domains", add the following domains:
     - `heartsmail.com`
     - `www.heartsmail.com`
     - `localhost:3000` (for development)
4. **Save the configuration**

### 2. Alternative: Create New Configuration
If you can't edit the existing configuration, create a new one:

1. **Create new configuration** in Stripe Dashboard
2. **Set the following**:
   - **Business name**: HeartMail
   - **Support email**: your support email
   - **Domains**: Add `heartsmail.com`, `www.heartsmail.com`, `localhost:3000`
   - **Return URL**: `https://heartsmail.com/dashboard/settings?tab=billing`
3. **Copy the new configuration ID**
4. **Update your code** to use the new configuration ID

### 3. Update Your Code
If you create a new configuration, update the customer portal API:

```typescript
// In app/api/stripe/customer-portal/route.ts
const portalSession = await stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?tab=billing`,
  configuration: 'bpc_YOUR_NEW_CONFIGURATION_ID', // Update this
})
```

### 4. Test the Fix
1. **Clear browser cache** and cookies
2. **Try opening the billing portal** again
3. **Check browser console** for any remaining errors

## Current Configuration ID
- **Current**: `bpc_1SKhbw8h6OhnnNXPTyeUFoVh`
- **Status**: Needs domain configuration update

## Expected Result
After updating the domain configuration, the Stripe Customer Portal should load properly in the iframe without CSP errors.
