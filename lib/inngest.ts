import { Inngest } from 'inngest'

export const inngest = new Inngest({ 
  id: 'heartmail',
  name: 'HeartMail'
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
