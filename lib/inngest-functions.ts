import { inngest } from '@/lib/inngest'
import { createAdminClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { logEmailSent } from '@/lib/activity-history'

const resend = new Resend(process.env.RESEND_API_KEY)

// Function to send scheduled emails
export const sendScheduledEmail = inngest.createFunction(
  { id: 'send-scheduled-email' },
  { event: 'email/send' },
  async ({ event, step }) => {
    const { scheduledEmailId, userId } = event.data

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
    const { scheduledEmailId, userId, sendAt } = event.data

    return await step.sleepUntil('wait-until-send-time', new Date(sendAt))
      .then(() => step.sendEvent('trigger-send', {
        name: 'email/send',
        data: {
          scheduledEmailId,
          userId
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

