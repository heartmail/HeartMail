import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'

// Simple test function
export const testFunction = inngest.createFunction(
  { id: 'test-function' },
  { event: 'test/hello' },
  async ({ event, step }) => {
    return await step.run('say-hello', async () => {
      console.log('Hello from Inngest!', event.data)
      return { message: 'Hello from HeartMail!', timestamp: new Date().toISOString() }
    })
  }
)

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [testFunction],
})
