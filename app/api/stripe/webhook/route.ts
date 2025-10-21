import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'
import { headers } from 'next/headers'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('No userId in session metadata')
          break
        }

        // Get the subscription
        const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Determine plan type based on price
        const priceAmount = subscription.items.data[0]?.price?.unit_amount || 0
        const planType = priceAmount === 999 ? 'family' : 'extended'

        // Update user's subscription in database
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            plan: planType,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log('Subscription updated successfully for user:', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription: Stripe.Subscription = event.data.object

        // Find user by customer ID
        const { data: userData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (userData) {
          // Update subscription status
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('user_id', userData.user_id)

          if (error) {
            console.error('Error updating subscription status:', error)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription: Stripe.Subscription = event.data.object

        // Find user by customer ID
        const { data: userData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (userData) {
          // Update subscription to cancelled
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'cancelled',
            })
            .eq('user_id', userData.user_id)

          if (error) {
            console.error('Error cancelling subscription:', error)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}