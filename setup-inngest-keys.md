# Inngest API Keys Setup

## Get Your Keys from Inngest Dashboard:
1. Go to https://app.inngest.com/
2. Navigate to Settings > Keys
3. Copy the following keys:

## Add to .env.local:
```
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
```

## Add to Vercel Environment Variables:
1. Go to your Vercel dashboard
2. Select your HeartMail project
3. Go to Settings > Environment Variables
4. Add both keys for Production, Preview, and Development
5. Redeploy your project

## Test the Setup:
Once keys are added, your scheduled emails will work automatically!
