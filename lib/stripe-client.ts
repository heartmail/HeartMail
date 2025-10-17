import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export const getStripe = () => stripePromise

export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await stripePromise
  if (!stripe) {
    throw new Error('Stripe failed to initialize')
  }

  const { error } = await (stripe as any).redirectToCheckout({ sessionId })
  if (error) {
    throw error
  }
}
