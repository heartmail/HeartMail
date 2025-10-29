import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { inngest } from '@/lib/inngest'
import { logEmailScheduled } from '@/lib/activity-history'
import { canScheduleEmails } from '@/lib/subscription'
import { convertToUTC, getUserTimezone } from '@/lib/timezone'

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
      sendAt,
      frequency = 'one-time',
      userTimezone = 'UTC'
    } = await request.json()

    // Validate required fields
    if (!userId || !recipientId || !toEmail || !subject || !bodyHtml || !sendAt) {
      return NextResponse.json(
        { error: 'Missing required fields (userId, recipientId, toEmail, subject, bodyHtml, sendAt)' },
        { status: 400 }
      )
    }

    // Check if user can schedule emails
    const canSchedule = await canScheduleEmails(userId)
    if (!canSchedule) {
      return NextResponse.json(
        { error: 'Email scheduling is only available with Family and Extended plans. Please upgrade to schedule emails.' },
        { status: 403 }
      )
    }

            // Convert user's local time to UTC for storage
            const userLocalDate = new Date(sendAt)
            const utcSendDate = convertToUTC(userLocalDate, userTimezone)
            
            // Validate sendAt is at least 2 minutes in the future (in UTC)
            const now = new Date()
            const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000) // 2 minutes from now
            
            if (utcSendDate <= twoMinutesFromNow) {
              return NextResponse.json(
                { error: 'Email must be scheduled for at least 2 minutes in the future' },
                { status: 400 }
              )
            }

    const supabase = createAdminClient()

    // Insert scheduled email into database with UTC time
    const { data: scheduledEmail, error: insertError } = await supabase
      .from('scheduled_emails')
      .insert({
        user_id: userId,
        recipient_id: recipientId,
        template_id: templateId || null,
        title: subject,
        content: bodyHtml,
        scheduled_date: utcSendDate.toISOString().split('T')[0],
        scheduled_time: utcSendDate.toTimeString().split(' ')[0],
        frequency: frequency,
        status: 'scheduled',
        user_timezone: userTimezone
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database error:', insertError)
      return NextResponse.json(
        { 
          error: 'Failed to schedule email',
          details: insertError.message,
          code: insertError.code
        },
        { status: 500 }
      )
    }

    // Log activity
    try {
      await logEmailScheduled(
        userId,
        toName || toEmail,
        subject,
        sendAt,
        scheduledEmail.id
      )
    } catch (activityError) {
      console.error('Failed to log activity:', activityError)
      // Don't fail the request if activity logging fails
    }

    // Schedule the email with Inngest using UTC time
    try {
      await inngest.send({
        name: 'email/schedule',
        data: {
          scheduledEmailId: scheduledEmail.id,
          userId: userId,
          sendAt: utcSendDate.toISOString(),
          userTimezone: userTimezone
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
