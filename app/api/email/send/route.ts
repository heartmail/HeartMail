import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, from } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use your verified domain for production, fallback to onboarding for testing
    const fromAddress = process.env.NODE_ENV === 'production' 
      ? 'HeartMail <noreply@letter.heartsmail.com>'
      : 'HeartMail <onboarding@resend.dev>'

    // In development/testing mode, only allow sending to your verified email
    const isTestingMode = process.env.NODE_ENV !== 'production'
    const verifiedEmail = 'heartmailio@gmail.com'
    
    // Skip testing mode restriction if NODE_ENV is explicitly set to production
    if (isTestingMode && to !== verifiedEmail) {
      return NextResponse.json(
        { 
          error: `Testing mode: Emails can only be sent to ${verifiedEmail}. Please use your verified email address for testing.`,
          testingMode: true,
          verifiedEmail 
        },
        { status: 403 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef5f5 0%, #fce7f3 100%);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; margin-bottom: 10px;">💕</div>
            <h1 style="color: #E63365; margin: 0; font-size: 28px; font-weight: 600;">HeartMail</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 16px;">Keeping hearts connected, one email at a time</p>
          </div>
          
          <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 20px;">
            <h2 style="color: #374151; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">${subject}</h2>
            <div style="color: #4b5563; line-height: 1.6; font-size: 16px; white-space: pre-wrap;">${message}</div>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">Sent with 💕 via HeartMail</p>
            <p style="margin: 5px 0 0 0;">From: ${from}</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id 
    })

  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
