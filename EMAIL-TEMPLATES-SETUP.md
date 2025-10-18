# 📧 HeartMail Email Templates Setup Guide

This guide will help you set up beautiful, on-brand email templates for HeartMail authentication flows.

## 🎨 What We've Created

### 1. **Enhanced Email Template Function** (`lib/auth-email-template.ts`)
- Beautiful HeartMail branding with pink gradients
- Nunito font for friendly appearance
- Responsive design for all email clients
- Logo integration with fallback
- Proper footer with links

### 2. **Three Authentication Email Templates**
- **Confirm Your Signup** - Welcome new users
- **Confirm Email Change** - Verify new email addresses
- **Reset Your Password** - Secure password reset

### 3. **Enhanced Settings Page**
- Email change functionality with modal
- Password reset functionality with modal
- Improved Security section with proper buttons

### 4. **Auth Pages**
- Forgot password page for logged-out users
- Update password page for password reset flow

## 🚀 How to Set Up in Supabase

### Step 1: Access Supabase Email Templates
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** (shield icon in sidebar)
3. Click on **Email Templates** in the Authentication menu

### Step 2: Configure Each Template

#### A. Confirm Your Signup Template
1. Find the **"Confirm signup"** section
2. **Subject:** `Welcome to HeartMail! Please Confirm Your Email 💕`
3. **Email content:** Copy the HTML from `confirmSignupEmail` in `lib/auth-email-template.ts`

#### B. Change Email Address Template  
1. Find the **"Change Email Address"** section
2. **Subject:** `Verify Your New Email for HeartMail`
3. **Email content:** Copy the HTML from `confirmEmailChangeEmail` in `lib/auth-email-template.ts`

#### C. Reset Password Template
1. Find the **"Reset Password"** section  
2. **Subject:** `Reset Your HeartMail Password`
3. **Email content:** Copy the HTML from `resetPasswordEmail` in `lib/auth-email-template.ts`

### Step 3: Test the Templates
1. Try signing up with a new email
2. Try changing your email in Settings > Security
3. Try resetting your password from the login page

## 🎯 Button Locations in the App

### 1. **Confirm Your Signup**
- **Location:** Automatic during signup process
- **No button needed** - triggered by Supabase Auth

### 2. **Confirm Email Change**  
- **Location:** Dashboard > Settings > Security
- **Button:** "Change Email" 
- **Functionality:** Opens modal to enter new email address

### 3. **Reset Your Password**
- **Location:** Dashboard > Settings > Security (for logged-in users)
- **Location:** Login page > "Forgot Password?" link (for logged-out users)
- **Functionality:** Sends reset link to current email

## 🔧 Technical Details

### Supabase Placeholders Used:
- `{{ .ConfirmationURL }}` - The confirmation/reset link
- `{{ .Email }}` - User's current email address  
- `{{ .NewEmail }}` - User's new email address (for email change)

### Email Sending Domain:
- Production: `letter.heartsmail.com`
- Development: `onboarding@resend.dev`

### Features Included:
- ✅ Beautiful HeartMail branding
- ✅ Responsive design
- ✅ Logo integration with fallback
- ✅ Gradient buttons with hover effects
- ✅ Proper error handling
- ✅ Success states
- ✅ Loading states
- ✅ Toast notifications

## 🎨 Design Features

### Visual Elements:
- **Header:** Pink gradient background with HeartMail logo
- **Typography:** Nunito font for friendly appearance
- **Colors:** HeartMail pink (#ff6b81) to red (#ff4757) gradients
- **Buttons:** Gradient buttons with shadow effects
- **Footer:** Clean footer with logo and links

### Responsive Design:
- Works on all email clients
- Mobile-friendly layout
- Proper fallbacks for images

## 🚨 Important Notes

1. **Domain Verification:** Ensure `letter.heartsmail.com` is verified with Resend
2. **Logo URL:** Make sure `https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png` is accessible
3. **Testing:** Test all three flows in both development and production
4. **Supabase Settings:** Ensure email sending is enabled in Supabase Auth settings

## 🎉 Result

Users will receive beautiful, on-brand emails that:
- Look professional and trustworthy
- Match HeartMail's loving, caring brand
- Work perfectly on all devices
- Guide users through the authentication process smoothly

The templates are now ready to be copied into your Supabase Email Templates section!
