# Stripe Integration Setup Guide

This guide will help you set up the complete Stripe integration for HeartMail, including database schema, API endpoints, and frontend components.

## 1. Database Setup

Run the following SQL script in your Supabase dashboard to create the subscription tables:

```sql
-- Copy and paste the contents of subscription-schema.sql into your Supabase SQL editor
```

## 2. Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (from your Stripe dashboard)
STRIPE_FAMILY_PRICE_ID=price_1SJ3gL8h6OhnnNXPXyTiD9Yo
STRIPE_EXTENDED_PRICE_ID=price_1SJ3gO8h6OhnnNXPY430Z8DW

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Stripe Webhook Setup

1. Go to your Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret and add it to your environment variables

## 4. Stripe Customer Portal Setup

1. Go to Stripe Dashboard → Settings → Billing → Customer Portal
2. Enable the Customer Portal
3. Configure the portal settings:
   - Allow customers to update payment methods
   - Allow customers to view billing history
   - Allow customers to cancel subscriptions
   - Set cancellation behavior (immediate or at period end)

## 5. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/pricing` to see the pricing page
3. Test the subscription flow:
   - Click on a paid plan
   - Complete the Stripe checkout
   - Check your Supabase database for the new subscription record
4. Test the billing settings:
   - Go to `/dashboard/settings?tab=billing`
   - Click "Manage Billing" to open the Stripe Customer Portal

## 6. Features Implemented

### Database Schema
- ✅ `subscriptions` table for user subscription data
- ✅ `subscription_usage` table for tracking limits
- ✅ `billing_history` table for payment records
- ✅ Row Level Security (RLS) policies
- ✅ Helper functions for subscription management

### API Endpoints
- ✅ `/api/stripe/checkout` - Create checkout sessions
- ✅ `/api/stripe/customer-portal` - Open customer portal
- ✅ `/api/stripe/subscription` - Get user subscription data
- ✅ `/api/stripe/webhook` - Handle Stripe webhooks

### Frontend Components
- ✅ Updated billing settings with real subscription data
- ✅ Pricing page with working upgrade buttons
- ✅ Subscription status display
- ✅ Usage tracking display
- ✅ Customer portal integration

### Stripe Integration
- ✅ Checkout session creation with coupon support
- ✅ Customer portal for billing management
- ✅ Webhook handlers for subscription updates
- ✅ Payment history tracking
- ✅ Usage limits enforcement

## 7. Usage Limits

The system enforces the following limits based on subscription plans:

### Free Plan
- 1 recipient
- 3 templates
- 10 emails per month

### Family Plan ($9.99/month)
- 5 recipients
- Unlimited templates
- 100 emails per month

### Extended Family Plan ($19.99/month)
- Unlimited recipients
- Unlimited templates
- Unlimited emails

## 8. Testing with Stripe CLI

For local testing, you can use the Stripe CLI:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test a subscription
stripe trigger checkout.session.completed
```

## 9. Production Deployment

1. Update environment variables with production values
2. Set up production webhook endpoint
3. Test the complete flow in production
4. Monitor webhook delivery in Stripe Dashboard

## 10. Monitoring

- Check Stripe Dashboard for subscription metrics
- Monitor webhook delivery in Stripe Dashboard
- Use Supabase dashboard to view subscription data
- Check application logs for any errors

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**: Check webhook endpoint URL and secret
2. **Subscription not updating**: Verify webhook events are being sent
3. **Customer portal not opening**: Check Stripe Customer Portal is enabled
4. **Database errors**: Verify RLS policies are correct

### Debug Steps

1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify environment variables are set correctly
4. Test webhook delivery in Stripe Dashboard
5. Check Supabase logs for database errors
