import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createEmailTemplate } from '@/lib/email-template'
import { logEmailSent } from '@/lib/activity-history'
import { incrementEmailCount } from '@/lib/subscription'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email send API called');
    
    const { to, subject, message, from, userId } = await request.json()
    console.log('📧 Request data:', { to, subject, message: message?.substring(0, 50) + '...', from, userId });

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

    // Use verified letter.heartsmail.com domain with sender name
    const senderName = from || 'HeartMail User'
    const fromAddress = `${senderName} <noreply@letter.heartsmail.com>`

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
    
    // Increment email count for user directly
    if (userId) {
      console.log('📧 About to increment email count for user:', userId)
      try {
        await incrementEmailCount(userId)
        console.log('✅ Email count incremented successfully for user:', userId)
      } catch (countError) {
        console.error('❌ Failed to increment email count:', countError)
        // Don't fail the request if count increment fails
      }
    } else {
      console.log('❌ No userId provided, skipping email count increment')
    }
    
    // Log activity (extract recipient name from email if possible)
    if (userId) {
      try {
        const recipientName = to.split('@')[0] // Use email prefix as name
        await logEmailSent(
          userId,
          recipientName,
          subject,
          data?.id
        )
      } catch (activityError) {
        console.error('Failed to log email sent activity:', activityError)
        // Don't fail the request if activity logging fails
      }
    }
    
    // Small delay to ensure database commits before returning
    await new Promise(resolve => setTimeout(resolve, 100))
    
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
