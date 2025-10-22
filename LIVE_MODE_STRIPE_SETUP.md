# Live Mode Stripe Setup ✅

## Current Live Mode Price IDs

Based on your existing live mode Stripe account, here are the correct price IDs:

### Family Plan
- **Monthly**: `price_1SJ3gL8h6OhnnNXPXyTiD9Yo` ($9.99/month)
- **Yearly**: Need to create yearly price

### Extended Family Plan  
- **Monthly**: `price_1SJ3gO8h6OhnnNXPY430Z8DW` ($19.99/month)
- **Yearly**: Need to create yearly price

## Environment Variables for Live Mode

Update your production environment variables with these LIVE mode price IDs:

```bash
# Stripe Pricing IDs (LIVE MODE)
NEXT_PUBLIC_STRIPE_FAMILY_MONTHLY_PRICE_ID=price_1SJ3gL8h6OhnnNXPXyTiD9Yo
NEXT_PUBLIC_STRIPE_FAMILY_YEARLY_PRICE_ID=price_1SKiu48h6OhnnNXPm2cjJqau
NEXT_PUBLIC_STRIPE_EXTENDED_MONTHLY_PRICE_ID=price_1SJ3gO8h6OhnnNXPY430Z8DW
NEXT_PUBLIC_STRIPE_EXTENDED_YEARLY_PRICE_ID=price_1SKiuE8h6OhnnNXP9nj1PEfP

# Stripe API Keys (LIVE MODE)
STRIPE_SECRET_KEY=rk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Next Steps

1. **Create Yearly Prices**: You'll need to create yearly prices in your Stripe Dashboard for the yearly options
2. **Update Production Environment**: Set these environment variables in your production deployment (Vercel)
3. **Test in Production**: Verify the upgrade buttons work with live mode

## Authentication Fixes Applied

✅ **Removed Profile Fetch Timeout**: No more 10-second delays
✅ **Non-blocking Profile Fetch**: Profile loads in background
✅ **Optimized Subscription Context**: Faster loading with fallbacks
✅ **Instant Authentication**: User state loads immediately

The authentication should now be instant with no delays!
