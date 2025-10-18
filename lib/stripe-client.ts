import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export const getStripe = () => stripePromise

export const redirectToCheckout = async (sessionId: string) => {
  // Get the checkout URL from our API
  const response = await fetch(`/api/stripe/checkout/url?sessionId=${sessionId}`)
  const { url } = await response.json()
  
  if (url) {
    window.location.href = url
  } else {
    throw new Error('Failed to get checkout URL')
  }
}
