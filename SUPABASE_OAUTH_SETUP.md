# Supabase Google OAuth Setup Guide

## Current Status ✅
- ✅ Environment variables updated in Vercel
- ✅ OAuth implementation completely redone
- ✅ All test pages removed
- ✅ App deployed with correct credentials
- ⏳ **NEXT**: Configure OAuth in Supabase Dashboard

## Required Supabase Configuration

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your HeartMail project: `fmuhjcrbwuoisjwuvreg`
3. Navigate to **Authentication** → **Providers**

### Step 2: Configure Google Provider
1. Find **Google** in the providers list
2. Click **Configure** or **Edit**
3. Enter the following credentials:

**Client ID:** `[YOUR_GOOGLE_CLIENT_ID]`
**Client Secret:** `[YOUR_GOOGLE_CLIENT_SECRET]`

### Step 3: Set Redirect URLs
In the Google provider settings, ensure these redirect URLs are configured:

**Authorized redirect URIs:**
- `https://fmuhjcrbwuoisjwuvreg.supabase.co/auth/v1/callback`
- `https://heartsmail.com/auth/callback`
- `https://heartsmail.com/dashboard`

### Step 4: Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID: `[YOUR_GOOGLE_CLIENT_ID]`
5. Update **Authorized redirect URIs** to include:
   - `https://fmuhjcrbwuoisjwuvreg.supabase.co/auth/v1/callback`

### Step 5: Enable Provider
1. In Supabase, make sure the Google provider is **enabled**
2. Save the configuration
3. Wait 2-3 minutes for changes to propagate

## Testing the Configuration

### Test OAuth Flow
1. Go to [https://heartsmail.com/login](https://heartsmail.com/login)
2. Click **"Continue with Google"**
3. Complete the OAuth flow
4. You should be redirected to the dashboard

### Debug if Issues Persist
If you still get "Unable to exchange external code" error:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs
   - Look for authentication errors

2. **Verify Credentials Match:**
   - Ensure client ID and secret are identical in both Supabase and Google Cloud Console
   - Check for typos or extra spaces

3. **Check Redirect URLs:**
   - Verify the redirect URL in Google Cloud Console exactly matches: `https://fmuhjcrbwuoisjwuvreg.supabase.co/auth/v1/callback`

4. **Wait for Propagation:**
   - Changes can take 5-10 minutes to propagate
   - Clear browser cache and try again

## Current Environment Variables (Already Set)
```
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
```

## Troubleshooting

### Common Issues:
1. **"Unable to exchange external code"** - Usually means client ID/secret mismatch
2. **"Invalid redirect URI"** - Check redirect URLs in Google Cloud Console
3. **"Client not found"** - Verify client ID is correct

### Quick Fixes:
- Double-check all credentials match exactly
- Ensure no extra spaces or characters
- Wait 5-10 minutes after making changes
- Clear browser cache and cookies
- Try in incognito/private browsing mode

## Success Indicators
- ✅ OAuth button appears on login/signup pages
- ✅ Clicking OAuth button redirects to Google
- ✅ After Google auth, user is redirected to dashboard
- ✅ User profile is created automatically
- ✅ No "Unable to exchange external code" errors

---

**Note:** The app is fully deployed and ready. The only remaining step is configuring the OAuth provider in the Supabase dashboard.
