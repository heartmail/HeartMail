import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (subscriptionId) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0].price.id

          // Update user subscription in database
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: session.metadata?.userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId,
              status: subscription.status,
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
              cancel_at_period_end: (subscription as any).cancel_at_period_end,
            })

          if (error) {
            console.error('Error updating subscription:', error)
          }

          // Initialize usage tracking
          await supabase
            .from('subscription_usage')
            .upsert({
              user_id: session.metadata?.userId,
              subscription_id: subscriptionId,
              recipients_count: 0,
              templates_used: 0,
              emails_sent_this_month: 0,
            })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Update subscription status
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('Error updating subscription:', error)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Cancel subscription
        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            cancel_at_period_end: false,
          })
          .eq('stripe_customer_id', customerId)

        if (error) {
          console.error('Error canceling subscription:', error)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const subscriptionId = (invoice as any).subscription as string

        // Get user ID from subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (subscriptionData) {
          // Record successful payment
          await supabase
            .from('billing_history')
            .insert({
              user_id: subscriptionData.user_id,
              subscription_id: subscriptionId,
              stripe_invoice_id: invoice.id,
              amount_paid: invoice.amount_paid,
              currency: invoice.currency,
              status: 'paid',
              invoice_url: invoice.invoice_pdf,
              hosted_invoice_url: invoice.hosted_invoice_url,
            })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const subscriptionId = (invoice as any).subscription as string

        // Get user ID from subscription
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (subscriptionData) {
          // Record failed payment
          await supabase
            .from('billing_history')
            .insert({
              user_id: subscriptionData.user_id,
              subscription_id: subscriptionId,
              stripe_invoice_id: invoice.id,
              amount_paid: 0,
              currency: invoice.currency,
              status: 'uncollectible',
              invoice_url: invoice.invoice_pdf,
              hosted_invoice_url: invoice.hosted_invoice_url,
            })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
