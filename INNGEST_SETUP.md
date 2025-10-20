# Inngest Setup Guide for HeartMail

This guide explains how to configure and deploy Inngest for scheduled emailing functionality in HeartMail.

## 🚀 Quick Start

### 1. Development Setup

```bash
# Start the Inngest dev server
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest

# In another terminal, start your Next.js app
npm run dev
```

### 2. Production Setup

```bash
# Deploy to production
node scripts/deploy-inngest.js
```

## 📋 Prerequisites

### Environment Variables

Make sure these environment variables are set in your production environment:

```bash
# Required for Inngest
INNGEST_SIGNING_KEY=your_signing_key_here
INNGEST_EVENT_KEY=your_event_key_here

# Required for email functionality
RESEND_API_KEY=your_resend_api_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App configuration
NEXT_PUBLIC_APP_URL=https://heartsmail.com
NODE_ENV=production
```

### Database Setup

Ensure your database has the required tables:

```sql
-- Run the database setup script
node scripts/setup-database.js
```

## 🔧 Configuration

### Inngest Functions

The following functions are configured:

1. **send-scheduled-email**: Sends scheduled emails to recipients
2. **schedule-email**: Schedules emails for future delivery
3. **test-function**: Simple test function for debugging

### Function Triggers

- `email/schedule`: Triggers when an email is scheduled
- `email/send`: Triggers when an email should be sent
- `test/hello`: Triggers for testing purposes

## 🧪 Testing

### Local Testing

```bash
# Run the integration test
node test-inngest-integration.js

# Test individual functions
curl -X POST http://localhost:3000/api/inngest/test \
  -H "Content-Type: application/json" \
  -d '{"name": "test/hello", "data": {"message": "Hello World"}}'
```

### Production Testing

```bash
# Test scheduled email
curl -X POST https://heartsmail.com/api/schedule-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "recipientId": "recipient-uuid", 
    "templateId": "template-uuid",
    "toEmail": "test@example.com",
    "toName": "Test User",
    "subject": "Test Email",
    "bodyHtml": "<h1>Test</h1>",
    "bodyText": "Test",
    "sendAt": "2024-12-25T10:00:00Z"
  }'
```

## 📊 Monitoring

### Inngest Dashboard

- **Development**: http://localhost:8288
- **Production**: https://app.inngest.com

### Key Metrics to Monitor

1. Function execution success rate
2. Function execution duration
3. Error rates and types
4. Queue depth and processing time

### Alerts

Set up alerts for:
- Function failures
- High error rates
- Long execution times
- Queue backlogs

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Kill existing processes with `pkill -f "inngest-cli"`
2. **Database UUID errors**: Ensure all IDs are valid UUIDs
3. **Email sending failures**: Check Resend API key and rate limits
4. **Function not triggering**: Verify event names and data structure

### Debug Commands

```bash
# Check Inngest dev server status
curl http://localhost:8288/health

# List deployed functions
npx inngest-cli@latest functions list

# View function logs
npx inngest-cli@latest functions logs <function-id>
```

## 🚀 Deployment

### Vercel Deployment

1. Set environment variables in Vercel dashboard
2. Deploy the application
3. Run the Inngest deployment script

### Manual Deployment

```bash
# Set production environment
export NODE_ENV=production

# Deploy functions
node scripts/deploy-inngest.js
```

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

## 🔒 Security

### API Keys

- Store all API keys in environment variables
- Use different keys for development and production
- Rotate keys regularly

### Function Security

- Validate all input data
- Use proper error handling
- Implement rate limiting
- Monitor for suspicious activity

## 📚 Additional Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest CLI Reference](https://www.inngest.com/docs/cli)
- [Resend API Documentation](https://resend.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 🆘 Support

If you encounter issues:

1. Check the logs in the Inngest dashboard
2. Verify environment variables
3. Test with the integration script
4. Check database connectivity
5. Verify email service configuration

For additional help, refer to the Inngest community or documentation.
