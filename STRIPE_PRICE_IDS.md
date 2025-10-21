# Stripe Price IDs for HeartMail

## Created Pricing Plans

### HeartMail Family Plan
- **Product ID**: `prod_TFYlHRHj1RNUnJ`
- **Monthly Price**: `price_1SKiu18h6OhnnNXPaihijGRz` ($9.99/month)
- **Yearly Price**: `price_1SKiu48h6OhnnNXPm2cjJqau` ($99.99/year - Save $20!)

### HeartMail Extended Family Plan  
- **Product ID**: `prod_THHTuBHUDqsixF`
- **Monthly Price**: `price_1SKiuB8h6OhnnNXPWnsVNHqv` ($29.99/month)
- **Yearly Price**: `price_1SKiuE8h6OhnnNXP9nj1PEfP` ($299.99/year - Save $60!)

## Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Pricing IDs
NEXT_PUBLIC_STRIPE_FAMILY_MONTHLY_PRICE_ID=price_1SKiu18h6OhnnNXPaihijGRz
NEXT_PUBLIC_STRIPE_FAMILY_YEARLY_PRICE_ID=price_1SKiu48h6OhnnNXPm2cjJqau
NEXT_PUBLIC_STRIPE_EXTENDED_MONTHLY_PRICE_ID=price_1SKiuB8h6OhnnNXPWnsVNHqv
NEXT_PUBLIC_STRIPE_EXTENDED_YEARLY_PRICE_ID=price_1SKiuE8h6OhnnNXP9nj1PEfP
```

## Usage in Frontend

These price IDs should be used in the pricing section to enable proper checkout functionality.
