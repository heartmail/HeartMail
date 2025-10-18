# 📧 Supabase Email Templates Setup Guide

## 🎨 Beautiful, On-Brand Email Templates

I've created three stunning email templates that match your HeartMail branding perfectly. These replace the basic HTML you currently have in Supabase.

## 🚀 How to Set Up in Supabase

### Step 1: Access Supabase Email Templates
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** (shield icon in sidebar)
3. Click on **Email Templates** in the Authentication menu

### Step 2: Copy and Paste Each Template

#### A. Confirm Your Signup Template
1. Find the **"Confirm signup"** section
2. **Subject:** `Welcome to HeartMail! Please Confirm Your Email 💕`
3. **Email content:** Copy the first HTML block from `supabase-email-templates.html`

#### B. Change Email Address Template  
1. Find the **"Change Email Address"** section
2. **Subject:** `Verify Your New Email for HeartMail`
3. **Email content:** Copy the second HTML block from `supabase-email-templates.html`

#### C. Reset Password Template
1. Find the **"Reset Password"** section  
2. **Subject:** `Reset Your HeartMail Password`
3. **Email content:** Copy the third HTML block from `supabase-email-templates.html`

## 🎯 What Makes These Templates Special

### ✨ Design Features:
- **HeartMail Branding:** Pink gradient headers with your logo
- **Professional Layout:** Clean, modern design with proper spacing
- **Responsive Design:** Works perfectly on all devices and email clients
- **Beautiful Buttons:** Gradient buttons with hover effects and shadows
- **Nunito Font:** Friendly, warm typography that matches your brand
- **Logo Integration:** Your Supabase logo with fallback to 💕 emoji

### 🎨 Visual Elements:
- **Header:** Pink gradient background with HeartMail logo and tagline
- **Content Card:** Clean white background with proper typography
- **Action Button:** Beautiful gradient button with shadow effects
- **Footer:** Professional footer with logo, links, and copyright

### 📱 Technical Features:
- **Email Client Compatible:** Works in Gmail, Outlook, Apple Mail, etc.
- **Mobile Responsive:** Looks great on phones and tablets
- **Fallback Support:** Logo fallback if image doesn't load
- **Proper Spacing:** Professional margins and padding
- **Accessibility:** Proper alt text and semantic HTML

## 🔧 Supabase Placeholders Used:
- `{{ .ConfirmationURL }}` - The confirmation/reset link
- `{{ .Email }}` - User's current email address  
- `{{ .NewEmail }}` - User's new email address (for email change)

## 🎉 Result

Your users will now receive:
- **Professional-looking emails** that build trust
- **On-brand design** that matches HeartMail's loving aesthetic
- **Clear call-to-action buttons** that are easy to click
- **Responsive emails** that work on all devices
- **Consistent branding** across all authentication flows

## 📋 Quick Setup Checklist:
- [ ] Copy first HTML block to "Confirm signup" template
- [ ] Copy second HTML block to "Change Email Address" template  
- [ ] Copy third HTML block to "Reset Password" template
- [ ] Update subject lines as specified
- [ ] Test all three email flows
- [ ] Verify logo loads correctly from Supabase storage

The templates are ready to copy and paste directly into Supabase! 🚀💕
