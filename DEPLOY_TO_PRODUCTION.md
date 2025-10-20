# Deploy HeartMail to Production

## 🚀 Quick Production Deployment

### 1. Deploy Your App to Vercel

```bash
# Deploy to production
vercel --prod

# Or if auto-deploy is enabled, just push to main
git push origin main
```

### 2. Deploy Inngest Functions

```bash
# Deploy functions to production
npm run inngest:deploy
```

### 3. Verify Everything Works

```bash
# Check deployed functions
npm run inngest:verify

# Test production (update with real UUIDs first)
node test-production.js
```

## ✅ That's It!

Your scheduled emailing is now live on **heartsmail.com**:

- ✅ **No localhost server needed** in production
- ✅ **Inngest runs in the cloud** automatically  
- ✅ **Functions execute** when emails are scheduled
- ✅ **Monitor everything** at https://app.inngest.com

## 🔧 Environment Variables (Vercel)

Make sure these are set in your Vercel dashboard:

```bash
INNGEST_SIGNING_KEY=signkey-prod-bd7828faa3d4337fada2a38e11a506fab5cf37f5017a3d4e4096514fa2e53660
INNGEST_EVENT_KEY=SHzWrGEX50yJRqhgA_tfLWtt9JWi1wq3Za0DRjQOwvP_Csf9_najQLci07wN3TXeyUtc4qhnMXQZ2vCk83uFjA
NEXT_PUBLIC_APP_URL=https://heartsmail.com
RESEND_API_KEY=re_GvGxzZwA_Jc3mdWdP9aoDFtq3cpTj6V4U
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Monitor Production

- **Inngest Dashboard**: https://app.inngest.com
- **Vercel Logs**: Vercel dashboard → Functions tab
- **Database**: Supabase dashboard

## 🧪 Test Production

```bash
# Test with real data (update UUIDs first)
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

## 🆘 Need Help?

1. Check Inngest dashboard for function status
2. Check Vercel logs for app errors  
3. Verify environment variables are set
4. Test with real user data from your database
