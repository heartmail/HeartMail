# Inngest Setup for Scheduled Emails

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Inngest Configuration
INNGEST_SIGNING_KEY=your_inngest_signing_key_here
INNGEST_EVENT_KEY=your_inngest_event_key_here

# Resend API Key (for sending emails)
RESEND_API_KEY=your_resend_api_key_here
```

## Getting Inngest Keys

1. **Sign up for Inngest**: Go to [https://inngest.com](https://inngest.com) and create an account
2. **Create a new app**: In your Inngest dashboard, create a new app called "HeartMail"
3. **Get your keys**: 
   - Go to your app settings
   - Copy the `Signing Key` and set it as `INNGEST_SIGNING_KEY`
   - Copy the `Event Key` and set it as `INNGEST_EVENT_KEY`

## Getting Resend API Key

1. **Sign up for Resend**: Go to [https://resend.com](https://resend.com) and create an account
2. **Create API key**: In your Resend dashboard, create a new API key
3. **Set the key**: Copy the API key and set it as `RESEND_API_KEY`

## Database Migration

Run this SQL in your Supabase SQL editor to add the missing `error_message` field:

```sql
-- Add error_message field to scheduled_emails table if it doesn't exist
ALTER TABLE scheduled_emails 
ADD COLUMN IF NOT EXISTS error_message TEXT;
```

## Testing Scheduled Emails

1. **Schedule an email**: Go to the Schedule page and create a new scheduled email
2. **Check Inngest dashboard**: Go to your Inngest dashboard to see the scheduled function
3. **Monitor execution**: Watch the function execute at the scheduled time

## Troubleshooting

- **Inngest not working**: Check that your environment variables are set correctly
- **Emails not sending**: Verify your Resend API key is valid
- **Database errors**: Make sure the `error_message` field has been added to the `scheduled_emails` table
