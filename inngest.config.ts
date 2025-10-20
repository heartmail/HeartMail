import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { sendScheduledEmail, scheduleEmail } from '@/lib/inngest-functions'

export default serve({
  client: inngest,
  functions: [sendScheduledEmail, scheduleEmail],
})

