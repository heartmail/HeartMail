import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createEmailTemplate } from '@/lib/email-template'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email send API called');
    
    const { to, subject, message, from } = await request.json()
    console.log('📧 Request data:', { to, subject, message: message?.substring(0, 50) + '...', from });

    if (!to || !subject || !message) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if Resend API key is available
    console.log('🔑 API Key check:', {
      hasKey: !!process.env.RESEND_API_KEY,
      keyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) + '...',
      nodeEnv: process.env.NODE_ENV
    });
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Use verified letter.heartsmail.com domain
    const fromAddress = 'HeartMail <noreply@letter.heartsmail.com>'

    console.log('📧 From address:', fromAddress);
    console.log('📧 NODE_ENV:', process.env.NODE_ENV);

    // For now, allow sending to any email address
    // TODO: Add proper domain verification and production setup
    console.log('📧 Sending to:', to);

    console.log('📧 Attempting to send email via Resend...');
    
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: subject,
      html: createEmailTemplate(subject, message, from),
    })

    if (error) {
      console.error('❌ Resend error:', error)
      console.error('❌ Resend error details:', {
        name: error.name,
        message: error.message,
        type: typeof error
      })
      return NextResponse.json(
        { error: `Failed to send email: ${error.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    console.log('✅ Email sent successfully:', data?.id);
    return NextResponse.json({ 
      success: true, 
      messageId: data?.id 
    })

  } catch (error) {
    console.error('❌ Email send error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
