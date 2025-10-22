# Live Mode Stripe Price IDs

## Current Live Mode Prices (from Stripe CLI)

### Family Plan
- **Monthly**: `price_1SJ3gL8h6OhnnNXPXyTiD9Yo` ($9.99/month)
- **Yearly**: Need to create in Stripe Dashboard

### Extended Family Plan  
- **Monthly**: `price_1SJ3gO8h6OhnnNXPY430Z8DW` ($19.99/month)
- **Yearly**: Need to create in Stripe Dashboard

## Environment Variables for Production

Update your production environment variables with these LIVE mode price IDs:

```bash
# Stripe Pricing IDs (LIVE MODE)
NEXT_PUBLIC_STRIPE_FAMILY_MONTHLY_PRICE_ID=price_1SJ3gL8h6OhnnNXPXyTiD9Yo
NEXT_PUBLIC_STRIPE_FAMILY_YEARLY_PRICE_ID=price_1SKiu48h6OhnnNXPm2cjJqau
NEXT_PUBLIC_STRIPE_EXTENDED_MONTHLY_PRICE_ID=price_1SJ3gO8h6OhnnNXPY430Z8DW
NEXT_PUBLIC_STRIPE_EXTENDED_YEARLY_PRICE_ID=price_1SKiuE8h6OhnnNXP9nj1PEfP
```

## Next Steps

1. **Create Yearly Prices**: You need to create yearly prices in your Stripe Dashboard for the yearly options
2. **Update Production Environment**: Set these environment variables in your production deployment (Vercel)
3. **Test**: Verify the upgrade buttons work with live mode

## Current Status

✅ Monthly prices are working with live mode IDs
⚠️ Yearly prices still use test mode IDs as fallback
