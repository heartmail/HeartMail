import { inngest } from '@/lib/inngest'
import { createAdminClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { logEmailSent } from '@/lib/activity-history'
import { incrementEmailCount } from '@/lib/subscription'

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper function to schedule the next occurrence of a recurring email
async function scheduleNextRecurringEmail(supabase: any, scheduledEmail: any, frequency: string) {
  const currentDate = new Date(scheduledEmail.scheduled_date)
  const currentTime = scheduledEmail.scheduled_time
  
  let nextDate: Date
  
  switch (frequency) {
    case 'daily':
      nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) // Add 1 day
      break
    case 'weekly':
      nextDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000) // Add 7 days
      break
    case 'monthly':
      nextDate = new Date(currentDate)
      nextDate.setMonth(nextDate.getMonth() + 1) // Add 1 month
      break
    default:
      return // Don't schedule for one-time emails
  }
  
  // Create next scheduled email
  const { data: nextEmail, error } = await supabase
    .from('scheduled_emails')
    .insert({
      user_id: scheduledEmail.user_id,
      recipient_id: scheduledEmail.recipient_id,
      template_id: scheduledEmail.template_id,
      title: scheduledEmail.title,
      content: scheduledEmail.content,
      scheduled_date: nextDate.toISOString().split('T')[0],
      scheduled_time: currentTime,
      frequency: frequency,
      status: 'scheduled',
      personal_message: scheduledEmail.personal_message
    })
    .select()
    .single()
    
  if (error) {
    throw new Error(`Failed to create next recurring email: ${error.message}`)
  }
  
  // Schedule the next email with Inngest
  const { inngest } = await import('@/lib/inngest')
  await inngest.send({
    name: 'email/schedule',
    data: {
      scheduledEmailId: nextEmail.id,
      userId: scheduledEmail.user_id,
      sendAt: new Date(`${nextDate.toISOString().split('T')[0]}T${currentTime}`).toISOString(),
      frequency: frequency
    }
  })
}

// Function to send scheduled emails
export const sendScheduledEmail = inngest.createFunction(
  { id: 'send-scheduled-email' },
  { event: 'email/send' },
  async ({ event, step }) => {
    const { scheduledEmailId, userId, frequency = 'one-time' } = event.data

    return await step.run('send-email', async () => {
      const supabase = createAdminClient()
      
      // Get the scheduled email
      const { data: scheduledEmail, error: fetchError } = await supabase
        .from('scheduled_emails')
        .select('*')
        .eq('id', scheduledEmailId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !scheduledEmail) {
        throw new Error(`Scheduled email not found: ${fetchError?.message}`)
      }

      // Check if already sent or cancelled
      if (scheduledEmail.status !== 'scheduled') {
        return { message: 'Email already processed', status: scheduledEmail.status }
      }

      // Update status to sending (we'll use 'scheduled' since 'sending' is not in enum)
      // We'll update to 'sent' or 'failed' after the operation

      try {
        // Get recipient email from recipients table
        const { data: recipient, error: recipientError } = await supabase
          .from('recipients')
          .select('email')
          .eq('id', scheduledEmail.recipient_id)
          .single()

        if (recipientError || !recipient) {
          throw new Error(`Recipient not found: ${recipientError?.message}`)
        }

        // Send the email
        const { data, error } = await resend.emails.send({
          from: 'HeartMail <noreply@letter.heartsmail.com>',
          to: [recipient.email],
          subject: scheduledEmail.title,
          html: scheduledEmail.content,
        })

        if (error) {
          throw new Error(`Resend error: ${error.message}`)
        }

        // Update status to sent
        await supabase
          .from('scheduled_emails')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', scheduledEmailId)

        // Increment email count for user
        try {
          await incrementEmailCount(userId)
          console.log('✅ Email count incremented for scheduled email:', userId)
        } catch (countError) {
          console.error('Failed to increment email count for scheduled email:', countError)
          // Don't fail the email send if count increment fails
        }

        // Log activity for email sent
        try {
          await logEmailSent(
            userId,
            recipient.email,
            scheduledEmail.title,
            data?.id
          )
        } catch (activityError) {
          console.error('Failed to log email sent activity:', activityError)
          // Don't fail the email send if activity logging fails
        }

        // Trigger global email sent event for frontend refresh
        // Note: This is handled server-side, so we can't dispatch browser events
        // The frontend will refresh when the user next visits the dashboard
        console.log('✅ Scheduled email sent successfully, frontend will refresh on next visit')

        // Handle recurring emails
        if (frequency !== 'one-time') {
          try {
            await scheduleNextRecurringEmail(supabase, scheduledEmail, frequency)
          } catch (recurringError) {
            console.error('Failed to schedule next recurring email:', recurringError)
            // Don't fail the current email send if recurring scheduling fails
          }
        }

        return { 
          message: 'Email sent successfully', 
          messageId: data?.id,
          status: 'sent'
        }

      } catch (error) {
        // Update status to failed
        await supabase
          .from('scheduled_emails')
          .update({ 
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', scheduledEmailId)

        throw error
      }
    })
  }
)

// Function to schedule emails (delayed execution)
export const scheduleEmail = inngest.createFunction(
  { id: 'schedule-email' },
  { event: 'email/schedule' },
  async ({ event, step }) => {
    const { scheduledEmailId, userId, sendAt, frequency = 'one-time' } = event.data

    return await step.sleepUntil('wait-until-send-time', new Date(sendAt))
      .then(() => step.sendEvent('trigger-send', {
        name: 'email/send',
        data: {
          scheduledEmailId,
          userId,
          frequency
        }
      }))
  }
)

// Function to cancel scheduled emails
export const cancelScheduledEmail = inngest.createFunction(
  { id: 'cancel-scheduled-email' },
  { event: 'email/cancel' },
  async ({ event, step }) => {
    const { scheduledEmailId, userId } = event.data

    return await step.run('cancel-email', async () => {
      const supabase = createAdminClient()
      
      // Check if the email still exists and is scheduled
      const { data: scheduledEmail, error: fetchError } = await supabase
        .from('scheduled_emails')
        .select('id, status')
        .eq('id', scheduledEmailId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !scheduledEmail) {
        return { message: 'Scheduled email not found or already processed', cancelled: false }
      }

      if (scheduledEmail.status !== 'scheduled') {
        return { message: 'Email already processed, cannot cancel', cancelled: false }
      }

      // Update status to cancelled
      const { error: updateError } = await supabase
        .from('scheduled_emails')
        .update({ status: 'cancelled' })
        .eq('id', scheduledEmailId)

      if (updateError) {
        throw new Error(`Failed to cancel email: ${updateError.message}`)
      }

      return { 
        message: 'Email cancellation scheduled successfully', 
        cancelled: true 
      }
    })
  }
)

