# Stripe Domain Configuration for HeartMail

## Issue
The Stripe customer portal iframe is being blocked because `heartsmail.com` is not configured as an allowed domain in your Stripe settings.

## Solution

### 1. Configure Stripe Customer Portal Settings

1. **Login to your Stripe Dashboard**
   - Go to https://dashboard.stripe.com/
   - Navigate to **Settings** → **Billing** → **Customer portal**

2. **Update Portal Configuration**
   - Find your portal configuration: `bpc_1SKhbw8h6OhnnNXPTyeUFoVh`
   - Click **Edit** on the configuration

3. **Add Allowed Domains**
   - In the **Business information** section
   - Add these domains to **Allowed domains**:
     - `heartsmail.com`
     - `www.heartsmail.com`
     - `localhost:3000` (for development)

4. **Update Return URLs**
   - Set **Return URL** to: `https://heartsmail.com/dashboard/settings?tab=billing`
   - Add development URL: `http://localhost:3000/dashboard/settings?tab=billing`

### 2. Alternative: Use Redirect Instead of Iframe

If iframe issues persist, modify the billing settings to redirect to Stripe instead of embedding:

```typescript
// In components/billing/billing-settings.tsx
const openCustomerPortal = async () => {
  // Instead of opening in iframe, redirect directly
  window.location.href = portalUrl
}
```

### 3. Test the Configuration

After updating Stripe settings:
1. Clear browser cache
2. Test the "Manage Plans" button
3. Check browser console for any remaining errors

## Current Error
```
Refused to display 'https://heartsmail.com/' in a frame because it set 'X-Frame-Options' to 'deny'
```

This happens because Stripe's customer portal is trying to load your domain in an iframe, but your domain has X-Frame-Options set to deny.
