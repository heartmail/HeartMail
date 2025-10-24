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
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Determine plan type based on price
        const priceAmount = subscription.items.data[0]?.price?.unit_amount || 0
        const planType = priceAmount === 999 ? 'family' : 'extended'

        // First, cancel any existing active subscriptions for this user
        const { data: existingSubscriptions } = await supabase
          .from('subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', userId)
          .eq('status', 'active')

        if (existingSubscriptions && existingSubscriptions.length > 0) {
          for (const existingSub of existingSubscriptions) {
            if (existingSub.stripe_subscription_id !== subscription.id) {
              try {
                console.log('Cancelling duplicate subscription:', existingSub.stripe_subscription_id)
                await stripe.subscriptions.cancel(existingSub.stripe_subscription_id)
                
                // Update database to reflect cancellation
                await supabase
                  .from('subscriptions')
                  .update({ status: 'cancelled' })
                  .eq('stripe_subscription_id', existingSub.stripe_subscription_id)
              } catch (error) {
                console.error('Error cancelling duplicate subscription:', error)
              }
            }
          }
        }

        // Update user's subscription in database
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            plan: planType,
            status: subscription.status,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          })

        if (error) {
          console.error('Error updating subscription:', error)
        } else {
          console.log('Subscription updated successfully for user:', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object

        // Find user by customer ID
        const { data: userData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (userData) {
          // Determine plan type based on price
          const priceAmount = subscription.items.data[0]?.price?.unit_amount || 0
          const planType = priceAmount === 999 ? 'family' : 'extended'

          // Update subscription status and plan
          const { error } = await supabase
            .from('subscriptions')
            .update({
              plan: planType,
              status: subscription.status,
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('user_id', userData.user_id)

          if (error) {
            console.error('Error updating subscription status:', error)
          } else {
            console.log('Subscription updated successfully for user:', userData.user_id, 'Plan:', planType)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object

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