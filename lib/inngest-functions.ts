import { inngest } from '@/lib/inngest'
import { createAdminClient } from '@/lib/supabase'
import { Resend } from 'resend'

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
      if (scheduledEmail.status !== 'pending') {
        return { message: 'Email already processed', status: scheduledEmail.status }
      }

      // Update status to sending
      await supabase
        .from('scheduled_emails')
        .update({ status: 'sending' })
        .eq('id', scheduledEmailId)

      try {
        // Send the email
        const { data, error } = await resend.emails.send({
          from: 'HeartMail <noreply@letter.heartsmail.com>',
          to: [scheduledEmail.to_email],
          subject: scheduledEmail.subject,
          html: scheduledEmail.body_html,
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
