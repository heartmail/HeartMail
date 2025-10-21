import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'
import Stripe from 'stripe'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set.')
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (!relevantEvents.has(event.type)) {
    return new NextResponse(JSON.stringify({ received: true }), { status: 200 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        const subscriptionId = checkoutSession.subscription as string
        const customerId = checkoutSession.customer as string
        const userId = checkoutSession.metadata?.userId as string

        if (!subscriptionId || !customerId || !userId) {
          throw new Error('Missing data in checkout.session.completed event.')
        }

        // Retrieve the subscription to get full details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan_id: subscription.items.data[0].price.id,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
          }, { onConflict: 'stripe_subscription_id' })

        if (error) throw error
        console.log(`Subscription created/updated for user ${userId}: ${subscription.id}`)
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find the user associated with this customer ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profileError || !profile) {
          console.error(`User not found for Stripe customer ID: ${customerId}`)
          throw new Error(`User not found for Stripe customer ID: ${customerId}`)
        }

        const userId = profile.id
        const priceId = subscription.items.data[0].price.id
        
        // Determine plan based on price ID
        let plan = 'free'
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
          plan = 'pro'
        } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) {
          plan = 'premium'
        }

        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            plan: plan,
            plan_id: priceId,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
          }, { onConflict: 'stripe_subscription_id' })

        if (error) throw error
        console.log(`Subscription ${event.type} for user ${userId}: ${subscription.id}`)
        break
      }
      default:
        console.warn(`Unhandled event type: ${event.type}`)
    }
  } catch (error: any) {
    console.error('Error handling Stripe webhook event:', error.message)
    return new NextResponse(`Webhook handler failed: ${error.message}`, { status: 500 })
  }

  return new NextResponse(JSON.stringify({ received: true }), { status: 200 })
}