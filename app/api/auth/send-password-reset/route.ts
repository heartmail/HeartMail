import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Missing email field' }, { status: 400 })
    }

    // Generate a password reset token using Supabase
    const supabase = createAdminClient()
    
    // Create a password reset token for the user
    const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
      }
    })

    if (tokenError) {
      console.error('Error generating password reset token:', tokenError)
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 })
    }

    const resetUrl = tokenData.properties.action_link

    // Send custom branded password reset email via Resend
    const { data, error } = await resend.emails.send({
      from: 'HeartMail Support <support@heartsmail.com>',
      to: [email],
      subject: 'Reset Your HeartMail Password 🔐',
      html: getPasswordResetTemplate(resetUrl),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    console.log('✅ Password reset email sent successfully via Resend')
    return NextResponse.json({ success: true, messageId: data?.id })

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getPasswordResetTemplate(resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your HeartMail Password 🔐</title>
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
        .security-note {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
          color: #856404;
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
          <h2 class="content-title">Reset Your Password 🔐</h2>
          <div class="content-body">
            <p>Hello there,</p>
            <p>We received a request to reset your HeartMail password. If you made this request, click the button below to reset your password:</p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>With love,</p>
            <p>The HeartMail Team</p>
          </div>
          <div class="button-container">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          <div class="security-note">
            <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
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
          <p class="footer-text">© 2025 HeartMail. All rights reserved.</p>
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
