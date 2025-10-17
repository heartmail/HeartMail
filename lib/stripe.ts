import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
})

export const STRIPE_CONFIG = {
  // Subscription plans
  plans: {
    free: {
      name: 'Free',
      price: 0,
      features: [
        '1 recipient',
        '3 basic templates',
        'Daily/Weekly/Monthly scheduling',
        'Basic customization'
      ]
    },
    family: {
      name: 'Family',
      price: 999, // $9.99 in cents
      stripePriceId: process.env.STRIPE_FAMILY_PRICE_ID,
      features: [
        'Up to 5 recipients',
        'All template categories',
        'Photo attachments',
        'Advanced scheduling',
        'Basic analytics'
      ]
    },
    extended: {
      name: 'Extended Family',
      price: 1999, // $19.99 in cents
      stripePriceId: process.env.STRIPE_EXTENDED_PRICE_ID,
      features: [
        'Unlimited recipients',
        'Premium templates',
        'AI personalization',
        'Priority support',
        'Advanced analytics'
      ]
    }
  },
  // Coupon codes
  coupons: {
    'PearsonFREEPearson': {
      name: 'Pearson Free Coupon',
      percent_off: 100,
      duration: 'forever'
    }
  }
}
