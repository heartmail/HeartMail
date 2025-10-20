# Production Deployment Guide for HeartMail

## 🚀 Production Architecture

### How Inngest Works in Production

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   heartsmail.com │    │   Inngest Cloud  │    │   Your Database │
│                 │    │                  │    │                 │
│ 1. User schedules│───▶│ 2. Event received│    │                 │
│    email         │    │    & queued      │    │                 │
│                 │    │                  │    │                 │
│                 │    │ 3. Function runs │───▶│ 4. Email sent   │
│                 │    │    at scheduled   │    │    & logged     │
│                 │    │    time           │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Key Points:**
- ❌ **No localhost server needed** in production
- ✅ **Inngest runs in the cloud** (managed infrastructure)
- ✅ **Your app** just sends events to Inngest
- ✅ **Functions execute automatically** on Inngest's servers

## 📋 Production Setup Steps

### 1. Environment Variables (Vercel)

Set these in your Vercel dashboard:

```bash
# Inngest Production Keys
INNGEST_SIGNING_KEY=signkey-prod-bd7828faa3d4337fada2a38e11a506fab5cf37f5017a3d4e4096514fa2e53660
INNGEST_EVENT_KEY=SHzWrGEX50yJRqhgA_tfLWtt9JWi1wq3Za0DRjQOwvP_Csf9_najQLci07wN3TXeyUtc4qhnMXQZ2vCk83uFjA

# Your existing variables
NEXT_PUBLIC_APP_URL=https://heartsmail.com
RESEND_API_KEY=re_GvGxzZwA_Jc3mdWdP9aoDFtq3cpTj6V4U
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Deploy Your App

```bash
# Deploy to Vercel
vercel --prod

# Or push to your main branch if auto-deploy is enabled
git push origin main
```

### 3. Deploy Inngest Functions

```bash
# Deploy functions to Inngest cloud
npx inngest-cli@latest deploy --url=https://heartsmail.com/api/inngest
```

### 4. Verify Production Setup

```bash
# Check deployed functions
npx inngest-cli@latest functions list --url=https://heartsmail.com/api/inngest

# Test a function
curl -X POST https://heartsmail.com/api/schedule-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "real-user-uuid",
    "recipientId": "real-recipient-uuid",
    "toEmail": "test@example.com",
    "subject": "Test Email",
    "bodyHtml": "<h1>Test</h1>",
    "sendAt": "2024-12-25T10:00:00Z"
  }'
```

## 🔧 Production Configuration

### Inngest Client Configuration

Your `lib/inngest.ts` is already configured for production:

```typescript
export const inngest = new Inngest({ 
  id: 'heartmail',
  name: 'HeartMail',
  signingKey: process.env.INNGEST_SIGNING_KEY  // Uses production key
})
```

### Function Endpoints

Your functions are already configured in `app/api/inngest/route.ts`:

```typescript
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendScheduledEmail, scheduleEmail, testFunction],
})
```

## 📊 Monitoring Production

### Inngest Dashboard
- **URL**: https://app.inngest.com
- **Login**: Use your Inngest account
- **Monitor**: Function executions, errors, performance

### Key Metrics to Watch
1. **Function Success Rate** (should be >95%)
2. **Execution Time** (should be <30s for email sending)
3. **Error Rate** (should be <5%)
4. **Queue Depth** (should be minimal)

## 🚨 Troubleshooting Production

### Common Issues

1. **Functions not triggering**
   - Check environment variables are set
   - Verify function deployment
   - Check Inngest dashboard for errors

2. **Database connection errors**
   - Verify Supabase connection
   - Check service role key
   - Ensure database schema is up to date

3. **Email sending failures**
   - Check Resend API key
   - Verify email templates
   - Check rate limits

### Debug Commands

```bash
# Check function status
npx inngest-cli@latest functions list --url=https://heartsmail.com/api/inngest

# View function logs
npx inngest-cli@latest functions logs <function-id> --url=https://heartsmail.com/api/inngest

# Test function manually
npx inngest-cli@latest functions trigger <function-id> --url=https://heartsmail.com/api/inngest
```

## 🔒 Security Considerations

### API Keys
- ✅ Store in environment variables (Vercel)
- ✅ Use different keys for dev/prod
- ✅ Rotate keys regularly
- ✅ Monitor for unauthorized access

### Function Security
- ✅ Validate all input data
- ✅ Use proper error handling
- ✅ Implement rate limiting
- ✅ Monitor for suspicious activity

## 📈 Performance Optimization

### Function Configuration
- **Retries**: 3 attempts with exponential backoff
- **Timeout**: 5 minutes for email sending
- **Concurrency**: 100 concurrent executions
- **Queue workers**: 100 workers

### Database Optimization
- Index on `scheduled_emails.user_id`
- Index on `scheduled_emails.scheduled_date`
- Index on `scheduled_emails.status`

## 🎯 Production Checklist

- [ ] Environment variables set in Vercel
- [ ] App deployed to production
- [ ] Inngest functions deployed
- [ ] Database schema up to date
- [ ] Email service configured
- [ ] Monitoring set up
- [ ] Error alerts configured
- [ ] Performance monitoring active

## 🆘 Support

If you encounter issues in production:

1. **Check Inngest Dashboard**: https://app.inngest.com
2. **Check Vercel Logs**: Vercel dashboard → Functions tab
3. **Check Database**: Supabase dashboard
4. **Test Functions**: Use the debug commands above

## 📚 Additional Resources

- [Inngest Production Guide](https://www.inngest.com/docs/production)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Supabase Production](https://supabase.com/docs/guides/platform/going-into-prod)
