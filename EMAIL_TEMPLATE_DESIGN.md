# HeartMail Email Template Design 💕

## Overview
Professional, on-brand, and warm email template used for both manual and scheduled emails.

---

## 📧 Email Structure

### **1. Header Section** (HeartMail Pink Gradient)
```
┌─────────────────────────────────────────┐
│     🖼️  HeartMail Logo (64x64)         │
│                                         │
│         HeartMail                       │
│   A heartfelt message for you ❤️       │
│                                         │
│   Background: Pink gradient (#E63365)  │
└─────────────────────────────────────────┘
```

**Features:**
- Beautiful pink gradient background (`#E63365 → #ec4899 → #f472b6`)
- HeartMail logo with shadow
- White text for contrast
- Rounded top corners for modern look

---

### **2. Decorative Hearts Border**
```
┌─────────────────────────────────────────┐
│     💕 💖 💕 💖 💕 💖 💕              │
└─────────────────────────────────────────┘
```

**Features:**
- Subtle hearts pattern (30% opacity)
- Adds warmth and playfulness
- Clean white background

---

### **3. Main Content Card**
```
┌─────────────────────────────────────────┐
│                                         │
│          Email Subject                  │
│     ──────────────────────              │
│                                         │
│   Your heartfelt message content...    │
│   • Clean white background             │
│   • Easy-to-read typography            │
│   • Generous line spacing (1.8)        │
│                                         │
│         ──────────                      │
│      (Pink divider)                     │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- White background for readability
- Subject line with pink underline
- 16px font size, 1.8 line height
- Pink gradient divider at bottom
- 40px padding for breathing room

---

### **4. Sender Info Section** (Light Pink Background)
```
┌─────────────────────────────────────────┐
│    From: user@example.com               │
│    Delivered with love on [Date]        │
│                                         │
│    Background: #fef5f5 (light pink)    │
└─────────────────────────────────────────┘
```

**Features:**
- Light pink background (`#fef5f5`)
- "From" in HeartMail pink (`#E63365`)
- Shows full delivery date
- Professional and informative

---

### **5. Footer** (Dark Gradient)
```
┌─────────────────────────────────────────┐
│        🖼️  HeartMail Logo (40x40)      │
│                                         │
│    Sent with 💕 via HeartMail          │
│  Keeping hearts connected, one email   │
│              at a time                  │
│                                         │
│    ┌──────────────────────┐            │
│    │ Start Sending Love ❤️│  (Button)  │
│    └──────────────────────┘            │
│                                         │
│   © 2025 HeartMail. All rights reserved│
│           heartsmail.com                │
│                                         │
│   Background: Dark gradient (#1f2937)  │
└─────────────────────────────────────────┘
```

**Features:**
- Dark gradient background for contrast
- HeartMail logo
- Brand tagline
- Pink CTA button (links to heartsmail.com)
- Copyright and website link
- Rounded bottom corners

---

## 🎨 Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| **Primary Pink** | `#E63365` | Headers, accents, CTA |
| **Light Pink** | `#ec4899` | Gradients, hover states |
| **Soft Pink** | `#f472b6` | Text highlights, links |
| **Pink Tint** | `#fef5f5` | Sender section background |
| **Dark Gray** | `#1f2937` | Footer background |
| **Text Gray** | `#374151` | Body text |
| **Light Gray** | `#6b7280` | Secondary text |
| **White** | `#ffffff` | Main content background |

---

## 🔤 Typography

- **Font Family:** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`
- **Headings:**
  - H1 (HeartMail): 28px, Bold (700)
  - H2 (Subject): 24px, Semibold (600)
- **Body Text:** 16px, Regular (400), Line height 1.8
- **Small Text:** 13-14px for metadata

---

## 📱 Responsive Design

**Table-based HTML:**
- Uses `<table>` elements for maximum email client compatibility
- Works in Gmail, Outlook, Apple Mail, Yahoo, etc.
- Mobile-friendly with max-width constraints
- Fallback fonts for universal support

**Mobile Optimization:**
- Stacks content vertically
- Touch-friendly CTA button
- Readable font sizes
- Proper padding for small screens

---

## ✨ Special Features

### **1. Professional Layout**
- Clean, organized structure
- Generous white space
- Visual hierarchy with sections
- Professional footer with branding

### **2. On-Brand Design**
- HeartMail pink throughout
- Heart emojis as decorative elements
- Warm, friendly tone
- Matches website branding

### **3. Email-Safe HTML**
- Table-based layout (not div/flex)
- Inline CSS styles
- No external stylesheets
- Maximum compatibility

### **4. Call-to-Action**
- "Start Sending Love ❤️" button
- Links to heartsmail.com
- Encourages new sign-ups
- Pink gradient on hover

### **5. Dynamic Content**
- Subject line
- Message body (supports HTML)
- Sender name/email
- Current date (formatted)

---

## 🔧 Technical Details

### **Email Template Function:**
```typescript
createEmailTemplate(subject: string, message: string, from: string)
```

**Parameters:**
- `subject` - Email subject line (shown as H2)
- `message` - Email body content (supports HTML)
- `from` - Sender name or email

**Used by:**
- Manual emails (Send with Love button)
- Scheduled emails (Inngest cron job)
- Both use the same template for consistency

---

## 📊 Before vs After

### **Before:**
- Simple gradient background
- Basic layout
- Minimal branding
- Plain footer

### **After:**
- ✅ Professional table-based structure
- ✅ HeartMail pink gradient header
- ✅ Decorative hearts border
- ✅ Clean content card
- ✅ Sender info section
- ✅ Professional footer with CTA
- ✅ Full branding throughout
- ✅ Mobile-responsive
- ✅ Email client compatible

---

## 🎯 Design Goals Achieved

1. **✅ Professional** - Clean, organized, polished
2. **✅ On-Brand** - HeartMail pink, logo, tagline
3. **✅ Warm** - Hearts, friendly copy, soft colors
4. **✅ Organized** - Clear sections, good spacing
5. **✅ Compatible** - Works in all email clients
6. **✅ Actionable** - CTA button to drive sign-ups

---

## 📧 Example Email Preview

```
┌─────────────────────────────────────────┐
│  🎀 HeartMail Pink Gradient Header      │
│         HeartMail Logo                  │
│         HeartMail                       │
│  A heartfelt message for you ❤️         │
├─────────────────────────────────────────┤
│     💕 💖 💕 💖 💕 💖 💕              │
├─────────────────────────────────────────┤
│                                         │
│     Just wanted to say I love you...    │
│     ─────────────────────────          │
│                                         │
│  Hey there! I was thinking about you    │
│  today and wanted to send some love     │
│  your way. You mean so much to me!      │
│                                         │
│              ──────────                 │
├─────────────────────────────────────────┤
│ 🎀 From: mom@example.com                │
│    Delivered with love on Oct 29, 2025  │
├─────────────────────────────────────────┤
│  🌙 Dark Footer                         │
│         HeartMail Logo                  │
│  Sent with 💕 via HeartMail            │
│  Keeping hearts connected...            │
│                                         │
│    [ Start Sending Love ❤️ ]           │
│                                         │
│    © 2025 HeartMail                     │
│    heartsmail.com                       │
└─────────────────────────────────────────┘
```

---

## 🚀 Impact

**User Experience:**
- Recipients see professional, branded emails
- Builds trust in HeartMail service
- Encourages sign-ups via CTA button
- Creates warm, positive feelings

**Brand Identity:**
- Consistent branding across all touchpoints
- Professional appearance
- Memorable design
- Reinforces "love and connection" message

---

## ✅ Status: Complete & Deployed

All emails (manual and scheduled) now use this beautiful, professional template! 💕

