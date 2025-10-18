# SendGrid API Key Setup (Optional Backup)

## Why SendGrid?
- Backup email service in case Resend has issues
- Better deliverability for high-volume sending
- Advanced email analytics

## Get Your SendGrid API Key:
1. Go to https://app.sendgrid.com/
2. Sign up for a free account (100 emails/day free)
3. Go to Settings > API Keys
4. Click "Create API Key"
5. Choose "Full Access" permissions
6. Copy the generated key

## Add to Environment:
```
SENDGRID_API_KEY=your_sendgrid_key_here
```

## Note:
This is optional - Resend is working fine for now!
