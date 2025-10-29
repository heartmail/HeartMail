# 🔍 Google OAuth Verification Guide

## Quick Verification Steps

### Step 1: Check Google Cloud Console Configuration

1. **Go to:** https://console.cloud.google.com/
2. **Select your project**
3. **Navigate to:** APIs & Services → Credentials
4. **Find your OAuth 2.0 Client:**
   - Client ID: `329473569521-bh3drhgft02l303vbmqndaj2j3r3glib.apps.googleusercontent.com`

### Step 2: Verify Authorized Redirect URIs

Click **Edit** on your OAuth Client and ensure these **EXACT** URIs are listed:

```
✅ https://fmuhjcrbwuoisjwuvreg.supabase.co/auth/v1/callback
✅ https://heartsmail.com/auth/callback  
✅ http://localhost:3000/auth/callback
```

**⚠️ CRITICAL:** The Supabase callback URI MUST match exactly:
- Use your project's Supabase URL
- Must include `/auth/v1/callback`
- Must use `https://`

### Step 3: Verify OAuth Consent Screen

1. **Go to:** APIs & Services → OAuth consent screen
2. **Verify these settings:**
   - ✅ App name: HeartMail
   - ✅ User support email: (your email)
   - ✅ Developer contact information: (your email)

3. **Verify Scopes:**
   - ✅ `openid`
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`

### Step 4: Test the Flow

1. **Clear your browser cookies/cache**
2. **Go to:** https://heartsmail.com/login
3. **Click:** "Continue with Google"
4. **Expected Flow:**
   - Redirects to Google sign-in
   - Shows Google consent screen
   - After approval, redirects back to your app
   - User lands on dashboard

### Step 5: Troubleshooting Common Errors

#### Error: "redirect_uri_mismatch"
**Cause:** The redirect URI doesn't match what's in Google Cloud Console

**Fix:**
1. Double-check the Supabase callback URL is EXACTLY:
   ```
   https://fmuhjcrbwuoisjwuvreg.supabase.co/auth/v1/callback
   ```
2. No trailing slashes
3. Must use `https://`
4. Wait 2-3 minutes after making changes

#### Error: "invalid_client"
**Cause:** Client ID or Secret mismatch

**Fix:**
1. Verify Client ID in `.env.local` matches Google Cloud Console
2. Verify Client Secret in `.env.local` matches Google Cloud Console
3. Check for extra spaces or quotes

#### Error: "access_denied"
**Cause:** User denied access or consent screen issues

**Fix:**
1. Check OAuth consent screen is published
2. Add test users if in "Testing" mode
3. Verify required scopes are added

#### Error: "server_error" in Supabase
**Cause:** Supabase can't validate the OAuth flow

**Fix:**
1. Check Supabase Dashboard → Authentication → Providers → Google
2. Verify "Enabled" is checked
3. Verify Client ID and Secret are set
4. Check "Skip nonce check" is enabled

---

## Current Configuration Status

### ✅ Verified in Codebase:
- Environment variables set correctly
- OAuth functions implemented
- Redirect handling configured
- Error handling in place

### ⚠️ Requires Manual Verification:
- Google Cloud Console redirect URIs
- OAuth consent screen published
- Test user access (if in testing mode)

---

## Testing Checklist

After updating Google Cloud Console:

- [ ] Clear browser cache and cookies
- [ ] Test signup with Google on **incognito/private window**
- [ ] Test login with Google on **incognito/private window**
- [ ] Verify user is created in Supabase `auth.users` table
- [ ] Verify user profile is created in `user_profiles` table
- [ ] Verify redirect to dashboard works
- [ ] Test on multiple browsers
- [ ] Test on mobile device

---

## Need Help?

### Debug Mode
To see detailed OAuth errors:

1. **Open browser console** (F12)
2. **Go to:** https://heartsmail.com/login
3. **Click:** "Continue with Google"
4. **Check console** for error messages

### Supabase Logs
1. **Go to:** https://supabase.com/dashboard
2. **Select project:** heartmail-site
3. **Click:** Logs → Auth logs
4. **Look for:** OAuth-related errors

### Contact Information
- Supabase Support: https://supabase.com/support
- Google OAuth Support: https://support.google.com/cloud/

---

**Last Updated:** $(date)
**Status:** Requires manual verification in Google Cloud Console

