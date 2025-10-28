# Google OAuth Fix Guide

## Current Issue
Google OAuth is failing with "server error during authentication" because the redirect URI configuration doesn't match between Google Cloud Console and Supabase.

## Required Fix

### 1. Update Google Cloud Console Redirect URIs

Go to [Google Cloud Console](https://console.cloud.google.com/) and update your OAuth 2.0 Client ID:

**Current Client ID:** `329473569521-bh3drhgft02l303vbmqndaj2j3r3glib.apps.googleusercontent.com`

**Required Redirect URIs:**
- `https://fmuhjcrbwuoisjwuvreg.supabase.co/auth/v1/callback`
- `https://heartsmail.com/auth/callback`
- `http://localhost:3000/auth/callback` (for local development)

### 2. Verify Supabase Configuration

The Supabase configuration is now correct with:
- ✅ Google OAuth enabled
- ✅ Client ID set via environment variable
- ✅ Client Secret set via environment variable
- ✅ Skip nonce check enabled
- ✅ Site URL: `https://heartsmail.com`

### 3. Test the Configuration

1. Go to https://heartsmail.com/test-oauth-config
2. Click "Test Google OAuth" to see detailed error information
3. Check the browser console for any additional error details

### 4. Common Issues and Solutions

**Issue: "redirect_uri_mismatch"**
- **Solution:** Ensure the redirect URI in Google Cloud Console exactly matches: `https://fmuhjcrbwuoisjwuvreg.supabase.co/auth/v1/callback`

**Issue: "invalid_client"**
- **Solution:** Verify the Client ID and Secret are correct in both Google Cloud Console and Supabase

**Issue: "access_denied"**
- **Solution:** Check that the OAuth consent screen is properly configured

### 5. Step-by-Step Google Cloud Console Fix

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID: `329473569521-bh3drhgft02l303vbmqndaj2j3r3glib.apps.googleusercontent.com`
5. Click **Edit** (pencil icon)
6. In **Authorized redirect URIs**, add/verify these URLs:
   - `https://fmuhjcrbwuoisjwuvreg.supabase.co/auth/v1/callback`
   - `https://heartsmail.com/auth/callback`
   - `http://localhost:3000/auth/callback`
7. Click **Save**
8. Wait 2-3 minutes for changes to propagate

### 6. Verify OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Ensure the consent screen is configured with:
   - **App name:** HeartMail
   - **User support email:** Your email
   - **Developer contact information:** Your email
3. Add the required scopes:
   - `openid`
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`

### 7. Test After Fix

1. Go to https://heartsmail.com/login
2. Click "Continue with Google"
3. Complete the OAuth flow
4. You should be redirected to the dashboard

## Current Status
- ✅ Supabase configuration is correct
- ✅ Environment variables are set
- ✅ OAuth provider is enabled
- ⏳ **NEXT:** Update Google Cloud Console redirect URIs

## Debug Information
- **Supabase Project:** `fmuhjcrbwuoisjwuvreg`
- **Supabase URL:** `https://fmuhjcrbwuoisjwuvreg.supabase.co`
- **Required Redirect URI:** `https://fmuhjcrbwuoisjwuvreg.supabase.co/auth/v1/callback`
- **App URL:** `https://heartsmail.com`
