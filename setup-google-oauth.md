# Google OAuth Setup for HeartMail

## ✅ **Environment Variables Added**
Your Google OAuth credentials have been added to `.env.local`:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## 🔧 **Next Steps: Configure Supabase**

### **1. Go to Supabase Dashboard**
1. Visit [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your HeartMail project

### **2. Configure Authentication**
1. Go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Click **Enable** for Google

### **3. Add Google OAuth Settings**
In the Google provider settings, add:

**Client ID:**
```
your_google_client_id_here
```

**Client Secret:**
```
your_google_client_secret_here
```

### **4. Set Redirect URLs**
Add these redirect URLs in Supabase:
```
https://heartsmail.com/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

### **5. Save Configuration**
Click **Save** to apply the Google OAuth settings.

## 🚀 **What's Been Implemented**

### **✅ Code Changes Made:**
1. **Environment Variables**: Added Google OAuth credentials
2. **OAuth Callback Route**: Created `/api/auth/callback/google/route.ts`
3. **Google OAuth Utility**: Created `lib/google-oauth.ts`
4. **Login Form**: Updated with functional Google sign-in button
5. **Signup Form**: Updated with functional Google sign-in button

### **✅ Features Added:**
- **Google Sign-In Button**: Works on both login and signup pages
- **Loading States**: Shows spinner during authentication
- **Error Handling**: Displays errors if authentication fails
- **Automatic Redirect**: Redirects to dashboard after successful login
- **OAuth Callback**: Handles the Google OAuth response

## 🧪 **Testing**

### **Local Testing:**
1. Run `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click "Continue with Google"
4. Complete Google authentication
5. Should redirect to dashboard

### **Production Testing:**
1. Deploy to `https://heartsmail.com`
2. Test Google sign-in on production
3. Verify redirect URLs work correctly

## 📋 **Troubleshooting**

### **Common Issues:**
1. **"Invalid redirect URI"**: Make sure redirect URLs are added to both Google Console and Supabase
2. **"Client ID not found"**: Verify environment variables are set correctly
3. **"Authentication failed"**: Check that Google OAuth is enabled in Supabase

### **Debug Steps:**
1. Check browser console for errors
2. Verify environment variables in production
3. Test redirect URLs are accessible
4. Confirm Google OAuth is enabled in Supabase

## 🎉 **You're All Set!**

Your HeartMail application now has fully functional Google OAuth authentication! Users can sign in with their Google accounts on both the login and signup pages.
