import { Inngest } from 'inngest'

export const inngest = new Inngest({ 
  id: 'heartmail',
  name: 'HeartMail',
  signingKey: process.env.INNGEST_SIGNING_KEY
})

// Define event types
export type Events = {
  'email/schedule': {
    data: {
      scheduledEmailId: string
      userId: string
      sendAt: string
    }
  }
  'email/send': {
    data: {
      scheduledEmailId: string
      userId: string
    }
  }
}
