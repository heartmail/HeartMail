# Stripe Checkout Setup Complete ✅

## Price IDs Retrieved from Stripe CLI

### Family Plan
- **Monthly**: `price_1SKiu18h6OhnnNXPaihijGRz` ($9.99/month)
- **Yearly**: `price_1SKiu48h6OhnnNXPm2cjJqau` ($99.99/year)

### Extended Family Plan  
- **Monthly**: `price_1SKiuB8h6OhnnNXPWnsVNHqv` ($29.99/month)
- **Yearly**: `price_1SKiuE8h6OhnnNXP9nj1PEfP` ($299.99/year)

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Stripe Pricing IDs
NEXT_PUBLIC_STRIPE_FAMILY_MONTHLY_PRICE_ID=price_1SKiu18h6OhnnNXPaihijGRz
NEXT_PUBLIC_STRIPE_FAMILY_YEARLY_PRICE_ID=price_1SKiu48h6OhnnNXPm2cjJqau
NEXT_PUBLIC_STRIPE_EXTENDED_MONTHLY_PRICE_ID=price_1SKiuB8h6OhnnNXPWnsVNHqv
NEXT_PUBLIC_STRIPE_EXTENDED_YEARLY_PRICE_ID=price_1SKiuE8h6OhnnNXP9nj1PEfP
```

## Fixes Applied

1. **Checkout API Enhanced**: 
   - Now checks both `subscriptions` and `profiles` tables for existing Stripe customer IDs
   - Creates new Stripe customers when needed
   - Updates both tables with new customer IDs

2. **Pricing Section Updated**:
   - Added fallback price IDs directly in code
   - Proper environment variable handling
   - Monthly/Yearly toggle working correctly

3. **Error Handling Improved**:
   - Better logging for debugging
   - Graceful fallbacks for missing data
   - Proper error messages

## Testing

1. **Restart your development server** after updating `.env.local`
2. **Navigate to pricing page** and test upgrade buttons
3. **Check console** for any remaining errors
4. **Test both monthly and yearly options**

The upgrade buttons should now work correctly with the proper Stripe price IDs!
