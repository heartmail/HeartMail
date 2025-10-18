import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, type, confirmationUrl } = await request.json()

    if (!email || !type || !confirmationUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let subject = ''
    let htmlContent = ''

    switch (type) {
      case 'signup':
        subject = 'Welcome to HeartMail! Please Confirm Your Email 💕'
        htmlContent = getSignupTemplate(confirmationUrl)
        break
      case 'email_change':
        subject = 'Verify Your New Email for HeartMail'
        htmlContent = getEmailChangeTemplate(confirmationUrl, email)
        break
      case 'password_reset':
        subject = 'Reset Your HeartMail Password'
        htmlContent = getPasswordResetTemplate(confirmationUrl)
        break
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'HeartMail Support <support@heartsmail.com>',
      to: [email],
      subject: subject,
      html: htmlContent,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getSignupTemplate(confirmationUrl: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to HeartMail! Please Confirm Your Email 💕</title>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Nunito', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f8f8f8;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          width: 100% !important;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
        }
        .header {
          background: linear-gradient(to right, #ff6b81, #ff4757);
          padding: 30px 20px;
          text-align: center;
          color: #ffffff;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }
        .logo-container {
          margin-bottom: 15px;
        }
        .logo-img {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        .logo-fallback {
          display: none;
          font-size: 60px;
          line-height: 1;
        }
        .title {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }
        .tagline {
          font-size: 16px;
          font-weight: 400;
          margin-top: 5px;
          opacity: 0.9;
        }
        .content-card {
          padding: 30px;
          color: #333333;
          line-height: 1.6;
          font-size: 16px;
        }
        .content-title {
          font-size: 22px;
          font-weight: 600;
          color: #333333;
          margin-top: 0;
          margin-bottom: 20px;
          text-align: center;
        }
        .content-body p {
          margin-bottom: 15px;
        }
        .button-container {
          text-align: center;
          margin-top: 30px;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(135deg, #ff6b81, #ff4757);
          color: #ffffff;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 18px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(255, 107, 129, 0.4);
          border: none;
          cursor: pointer;
        }
        .button:hover {
          background: linear-gradient(135deg, #ff4757, #ff6b81);
          box-shadow: 0 8px 25px rgba(255, 107, 129, 0.6);
          transform: translateY(-2px);
        }
        .footer {
          background-color: #f0f0f0;
          padding: 25px 20px;
          text-align: center;
          font-size: 13px;
          color: #777777;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }
        .footer-logo-container {
          margin-bottom: 10px;
        }
        .footer-logo-img {
          width: 40px;
          height: 40px;
          object-fit: contain;
          opacity: 0.8;
        }
        .footer-logo-fallback {
          display: none;
          font-size: 40px;
          line-height: 1;
        }
        .footer-link {
          color: #777777;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <!-- Header with Logo -->
        <div class="header">
          <div class="logo-container">
            <img src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png" 
                 alt="HeartMail Logo" 
                 class="logo-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="logo-fallback">💕</div>
          </div>
          <h1 class="title">HeartMail</h1>
          <p class="tagline">Keeping hearts connected, one email at a time</p>
        </div>

        <!-- Email Content Card -->
        <div class="content-card">
          <h2 class="content-title">Welcome to HeartMail! Please Confirm Your Email 💕</h2>
          <div class="content-body">
            <p>Hello there,</p>
            <p>Welcome to HeartMail! We're so excited to have you join our community dedicated to keeping hearts connected, one email at a time.</p>
            <p>To activate your account and start sending heartfelt messages, please click the button below:</p>
            <p>If you didn't sign up for HeartMail, please ignore this email.</p>
            <p>With love,</p>
            <p>The HeartMail Team</p>
          </div>
          <div class="button-container">
            <a href="${confirmationUrl}" class="button">Confirm My Account</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo-container">
            <img src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png" 
                 alt="HeartMail" 
                 class="footer-logo-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="footer-logo-fallback">💕</div>
          </div>
          <p class="footer-text">Sent with 💕 via HeartMail</p>
          <p class="footer-text">© 2024 HeartMail. All rights reserved.</p>
          <p class="footer-text">
            <a href="https://heartsmail.com/privacy" class="footer-link">Privacy Policy</a> | 
            <a href="https://heartsmail.com/terms" class="footer-link">Terms of Service</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `
}

function getEmailChangeTemplate(confirmationUrl: string, email: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your New Email for HeartMail</title>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Nunito', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f8f8f8;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          width: 100% !important;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
        }
        .header {
          background: linear-gradient(to right, #ff6b81, #ff4757);
          padding: 30px 20px;
          text-align: center;
          color: #ffffff;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }
        .logo-container {
          margin-bottom: 15px;
        }
        .logo-img {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        .logo-fallback {
          display: none;
          font-size: 60px;
          line-height: 1;
        }
        .title {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }
        .tagline {
          font-size: 16px;
          font-weight: 400;
          margin-top: 5px;
          opacity: 0.9;
        }
        .content-card {
          padding: 30px;
          color: #333333;
          line-height: 1.6;
          font-size: 16px;
        }
        .content-title {
          font-size: 22px;
          font-weight: 600;
          color: #333333;
          margin-top: 0;
          margin-bottom: 20px;
          text-align: center;
        }
        .content-body p {
          margin-bottom: 15px;
        }
        .button-container {
          text-align: center;
          margin-top: 30px;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(135deg, #ff6b81, #ff4757);
          color: #ffffff;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 18px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(255, 107, 129, 0.4);
          border: none;
          cursor: pointer;
        }
        .button:hover {
          background: linear-gradient(135deg, #ff4757, #ff6b81);
          box-shadow: 0 8px 25px rgba(255, 107, 129, 0.6);
          transform: translateY(-2px);
        }
        .footer {
          background-color: #f0f0f0;
          padding: 25px 20px;
          text-align: center;
          font-size: 13px;
          color: #777777;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }
        .footer-logo-container {
          margin-bottom: 10px;
        }
        .footer-logo-img {
          width: 40px;
          height: 40px;
          object-fit: contain;
          opacity: 0.8;
        }
        .footer-logo-fallback {
          display: none;
          font-size: 40px;
          line-height: 1;
        }
        .footer-link {
          color: #777777;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <!-- Header with Logo -->
        <div class="header">
          <div class="logo-container">
            <img src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png" 
                 alt="HeartMail Logo" 
                 class="logo-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="logo-fallback">💕</div>
          </div>
          <h1 class="title">HeartMail</h1>
          <p class="tagline">Keeping hearts connected, one email at a time</p>
        </div>

        <!-- Email Content Card -->
        <div class="content-card">
          <h2 class="content-title">Verify Your New Email for HeartMail</h2>
          <div class="content-body">
            <p>Hello,</p>
            <p>You recently requested to change your email address associated with your HeartMail account to <strong>${email}</strong>.</p>
            <p>To complete this change, please click the button below to verify your new email address:</p>
            <p>If you did not request this change, please ignore this email or contact our support team immediately.</p>
            <p>With love,</p>
            <p>The HeartMail Team</p>
          </div>
          <div class="button-container">
            <a href="${confirmationUrl}" class="button">Verify New Email</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo-container">
            <img src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png" 
                 alt="HeartMail" 
                 class="footer-logo-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="footer-logo-fallback">💕</div>
          </div>
          <p class="footer-text">Sent with 💕 via HeartMail</p>
          <p class="footer-text">© 2024 HeartMail. All rights reserved.</p>
          <p class="footer-text">
            <a href="https://heartsmail.com/privacy" class="footer-link">Privacy Policy</a> | 
            <a href="https://heartsmail.com/terms" class="footer-link">Terms of Service</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `
}

function getPasswordResetTemplate(confirmationUrl: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your HeartMail Password</title>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Nunito', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f8f8f8;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          width: 100% !important;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
        }
        .header {
          background: linear-gradient(to right, #ff6b81, #ff4757);
          padding: 30px 20px;
          text-align: center;
          color: #ffffff;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }
        .logo-container {
          margin-bottom: 15px;
        }
        .logo-img {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        .logo-fallback {
          display: none;
          font-size: 60px;
          line-height: 1;
        }
        .title {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }
        .tagline {
          font-size: 16px;
          font-weight: 400;
          margin-top: 5px;
          opacity: 0.9;
        }
        .content-card {
          padding: 30px;
          color: #333333;
          line-height: 1.6;
          font-size: 16px;
        }
        .content-title {
          font-size: 22px;
          font-weight: 600;
          color: #333333;
          margin-top: 0;
          margin-bottom: 20px;
          text-align: center;
        }
        .content-body p {
          margin-bottom: 15px;
        }
        .button-container {
          text-align: center;
          margin-top: 30px;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          padding: 16px 32px;
          background: linear-gradient(135deg, #ff6b81, #ff4757);
          color: #ffffff;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 18px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(255, 107, 129, 0.4);
          border: none;
          cursor: pointer;
        }
        .button:hover {
          background: linear-gradient(135deg, #ff4757, #ff6b81);
          box-shadow: 0 8px 25px rgba(255, 107, 129, 0.6);
          transform: translateY(-2px);
        }
        .footer {
          background-color: #f0f0f0;
          padding: 25px 20px;
          text-align: center;
          font-size: 13px;
          color: #777777;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }
        .footer-logo-container {
          margin-bottom: 10px;
        }
        .footer-logo-img {
          width: 40px;
          height: 40px;
          object-fit: contain;
          opacity: 0.8;
        }
        .footer-logo-fallback {
          display: none;
          font-size: 40px;
          line-height: 1;
        }
        .footer-link {
          color: #777777;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <!-- Header with Logo -->
        <div class="header">
          <div class="logo-container">
            <img src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png" 
                 alt="HeartMail Logo" 
                 class="logo-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="logo-fallback">💕</div>
          </div>
          <h1 class="title">HeartMail</h1>
          <p class="tagline">Keeping hearts connected, one email at a time</p>
        </div>

        <!-- Email Content Card -->
        <div class="content-card">
          <h2 class="content-title">Reset Your HeartMail Password</h2>
          <div class="content-body">
            <p>Hello,</p>
            <p>You have requested to reset the password for your HeartMail account. No worries, it happens!</p>
            <p>To set a new password, please click the button below:</p>
            <p>This link is valid for a limited time. If you did not request a password reset, please ignore this email.</p>
            <p>With love,</p>
            <p>The HeartMail Team</p>
          </div>
          <div class="button-container">
            <a href="${confirmationUrl}" class="button">Reset My Password</a>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-logo-container">
            <img src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png" 
                 alt="HeartMail" 
                 class="footer-logo-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="footer-logo-fallback">💕</div>
          </div>
          <p class="footer-text">Sent with 💕 via HeartMail</p>
          <p class="footer-text">© 2024 HeartMail. All rights reserved.</p>
          <p class="footer-text">
            <a href="https://heartsmail.com/privacy" class="footer-link">Privacy Policy</a> | 
            <a href="https://heartsmail.com/terms" class="footer-link">Terms of Service</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `
}
