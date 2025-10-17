# Update Google OAuth Configuration

## 1. Google Cloud Console Configuration

### Update OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" > "OAuth consent screen"
4. Update the following fields:

**Application name:**
```
HeartMail
```

**User support email:**
```
heartmailio@gmail.com
```

**Developer contact information:**
```
heartmailio@gmail.com
```

**Authorized domains:**
```
heartmail.com
```

### Update OAuth Client
1. Go to "APIs & Services" > "Credentials"
2. Click on your OAuth 2.0 Client ID
3. Update the following:

**Authorized JavaScript origins:**
```
https://heartsmail.com
http://localhost:3000
```

**Authorized redirect URIs:**
```
https://heartsmail.com/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

## 2. Supabase Configuration

### Update Site URL
1. Go to your Supabase project dashboard
2. Go to "Authentication" > "URL Configuration"
3. Update the following:

**Site URL:**
```
https://heartsmail.com
```

**Redirect URLs:**
```
https://heartsmail.com/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

### Update Google Provider Settings
1. Go to "Authentication" > "Providers"
2. Click on "Google"
3. Make sure these are set:

**Client ID:**
```
YOUR_GOOGLE_CLIENT_ID_HERE
```

**Client Secret:**
```
YOUR_GOOGLE_CLIENT_SECRET_HERE
```

## 3. Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_APP_URL=https://heartsmail.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

## 4. Test the Configuration

After making these changes:
1. Restart your development server
2. Try Google sign-in
3. The consent screen should now show "heartmail.com" and your custom logo