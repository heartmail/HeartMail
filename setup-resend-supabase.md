# Setting up Resend with Supabase for Authentication Emails

## Option 1: Configure Supabase to use Resend (Recommended)

### Step 1: Configure Resend Domain
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain `heartsmail.com` (or use Resend's domain)
3. Configure DNS records as instructed

### Step 2: Configure Supabase Auth Settings
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Settings
3. Under "SMTP Settings":
   - **Enable custom SMTP**: Yes
   - **Host**: `smtp.resend.com`
   - **Port**: `587`
   - **Username**: `resend`
   - **Password**: Your Resend API key
   - **Sender email**: `noreply@heartsmail.com` (or your verified domain)
   - **Sender name**: `HeartMail`

### Step 3: Update Email Templates
1. In Supabase Dashboard > Authentication > Email Templates
2. Customize the "Confirm signup" template with HeartMail branding
3. Use your custom domain for links

## Option 2: Use Custom Email API (Current Implementation)

Our current implementation already uses Resend via `/api/auth/send-confirmation`. This should work, but let me check if there are any issues.

## Troubleshooting

### Check if emails are being sent:
1. Check Resend dashboard for email logs
2. Check Supabase logs for auth events
3. Verify email addresses are valid

### Common Issues:
1. **Rate limits**: Supabase built-in service has limits
2. **Domain verification**: Make sure your domain is verified in Resend
3. **SMTP configuration**: Ensure SMTP settings are correct
4. **Email templates**: Check if templates are properly configured

## Testing

To test email delivery:
1. Try signing up with a test email
2. Check spam folder
3. Check Resend dashboard for delivery status
4. Check Supabase logs for any errors
