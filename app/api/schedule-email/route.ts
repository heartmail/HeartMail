import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { inngest } from '@/lib/inngest'

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      recipientId, 
      templateId, 
      toEmail, 
      toName, 
      subject, 
      bodyHtml, 
      bodyText, 
      sendAt 
    } = await request.json()

    // Validate required fields
    if (!userId || !toEmail || !subject || !bodyHtml || !sendAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate sendAt is in the future
    const sendDate = new Date(sendAt)
    if (sendDate <= new Date()) {
      return NextResponse.json(
        { error: 'Send date must be in the future' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Insert scheduled email into database
    const { data: scheduledEmail, error: insertError } = await supabase
      .from('scheduled_emails')
      .insert({
        user_id: userId,
        recipient_id: recipientId,
        template_id: templateId,
        title: subject,
        content: bodyHtml,
        scheduled_date: new Date(sendAt).toISOString().split('T')[0],
        scheduled_time: new Date(sendAt).toTimeString().split(' ')[0],
        status: 'scheduled'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { error: 'Failed to schedule email' },
        { status: 500 }
      )
    }

    // Schedule the email with Inngest
    try {
      await inngest.send({
        name: 'email/schedule',
        data: {
          scheduledEmailId: scheduledEmail.id,
          userId: userId,
          sendAt: sendAt
        }
      })

      return NextResponse.json({ 
        success: true, 
        scheduledEmailId: scheduledEmail.id,
        message: 'Email scheduled successfully'
      })

    } catch (inngestError) {
      console.error('Inngest error:', inngestError)
      
      // If Inngest fails, mark as failed in database
      await supabase
        .from('scheduled_emails')
        .update({ 
          status: 'failed',
          error_message: 'Failed to schedule with Inngest'
        })
        .eq('id', scheduledEmail.id)

      return NextResponse.json(
        { error: 'Failed to schedule email' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Schedule email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
