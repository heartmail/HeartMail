# HeartMail Domain & Stripe Configuration Guide

## 🌐 Domain Configuration: heartsmail.com

### 1. Production Environment Setup

Your production environment is configured with:
- **Domain**: `https://heartsmail.com`
- **Stripe Live Mode**: ✅ Configured
- **Webhook Endpoint**: `https://heartsmail.com/api/stripe/webhook`

### 2. Local Development Setup

For local testing, you have:
- **Local URL**: `http://localhost:3000`
- **Stripe CLI**: Running webhook forwarding
- **Test Mode**: Available alongside live mode

## 🔧 Stripe Configuration

### Production Webhooks (heartsmail.com)

You need to configure these webhooks in your Stripe Dashboard:

1. **Go to**: Stripe Dashboard → Webhooks
2. **Add Endpoint**: `https://heartsmail.com/api/stripe/webhook`
3. **Select Events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Local Testing Webhooks (localhost:3000)

The Stripe CLI is already running and forwarding webhooks to your local development server.

**Current CLI Command**:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 🚀 Deployment Checklist

### 1. Domain DNS Configuration
Make sure your domain `heartsmail.com` points to your hosting provider:
- **A Record**: `heartsmail.com` → Your server IP
- **CNAME**: `www.heartsmail.com` → `heartsmail.com`

### 2. SSL Certificate
Ensure your domain has a valid SSL certificate for HTTPS.

### 3. Environment Variables
Your `.env.local` is configured with:
```env
NEXT_PUBLIC_APP_URL=https://heartsmail.com
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Database Setup
Run the subscription schema in your Supabase dashboard:
```sql
-- Copy and paste subscription-schema.sql content
```

## 🧪 Testing Setup

### Local Testing
1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Stripe Integration**:
   - Visit: `http://localhost:3000/pricing`
   - Test subscription flow
   - Check webhook delivery in terminal

3. **Test API Endpoints**:
   ```bash
   # Test Stripe connection
   curl http://localhost:3000/api/test-stripe
   
   # Test subscription endpoint
   curl "http://localhost:3000/api/stripe/subscription?userId=YOUR_USER_ID"
   ```

### Production Testing
1. **Deploy to Production**:
   - Deploy your app to `heartsmail.com`
   - Ensure all environment variables are set

2. **Test Production Flow**:
   - Visit: `https://heartsmail.com/pricing`
   - Test real subscription flow
   - Check Stripe Dashboard for webhook delivery

## 🔍 Stripe CLI Commands

### Start Webhook Forwarding (Local)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Test Events (Local)
```bash
# Test successful checkout
stripe trigger checkout.session.completed

# Test subscription update
stripe trigger customer.subscription.updated

# Test payment success
stripe trigger invoice.payment_succeeded
```

### View Webhook Logs
```bash
stripe logs tail
```

## 📊 Monitoring & Debugging

### Stripe Dashboard
- **Webhooks**: Monitor delivery status
- **Events**: View all webhook events
- **Customers**: Check customer creation
- **Subscriptions**: Monitor subscription status

### Application Logs
- Check your hosting provider logs
- Monitor webhook endpoint responses
- Verify database updates

### Database Monitoring
- Check Supabase dashboard for subscription records
- Verify webhook data is being stored correctly
- Monitor usage tracking updates

## 🚨 Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**:
   - Check webhook endpoint URL
   - Verify webhook secret matches
   - Check SSL certificate validity

2. **Subscription Not Updating**:
   - Verify webhook events are enabled
   - Check database connection
   - Review webhook handler logs

3. **Local Testing Issues**:
   - Ensure Stripe CLI is running
   - Check localhost:3000 is accessible
   - Verify webhook forwarding is active

### Debug Steps

1. **Check Webhook Delivery**:
   ```bash
   stripe events list --limit 10
   ```

2. **Test Webhook Endpoint**:
   ```bash
   curl -X POST https://heartsmail.com/api/stripe/webhook \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

3. **Verify Environment Variables**:
   - Check all required variables are set
   - Verify Stripe keys are correct
   - Confirm domain URLs are accurate

## 🎯 Next Steps

1. **Deploy to Production**: Deploy your app to `heartsmail.com`
2. **Configure Production Webhooks**: Set up webhooks in Stripe Dashboard
3. **Test Complete Flow**: Test subscription flow end-to-end
4. **Monitor Performance**: Set up monitoring and alerts
5. **Go Live**: Launch your HeartMail service!

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Stripe Dashboard webhook logs
3. Check your application logs
4. Verify database connectivity

Your HeartMail service is now ready for both local testing and production deployment! 🚀
