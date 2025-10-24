import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { priceId, customerEmail, couponCode, userId } = await request.json()

    if (!priceId || !customerEmail || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get or create Stripe customer
    let customerId: string

    // Check if user already has a Stripe customer ID
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', userId)
      .single()

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id
      
      // Cancel existing active subscription if it exists
      if (existingSubscription.stripe_subscription_id) {
        try {
          const existingStripeSubscription = await stripe.subscriptions.retrieve(
            existingSubscription.stripe_subscription_id
          )
          
          if (existingStripeSubscription.status === 'active') {
            console.log('Cancelling existing subscription:', existingSubscription.stripe_subscription_id)
            await stripe.subscriptions.update(existingSubscription.stripe_subscription_id, {
              cancel_at_period_end: false, // Cancel immediately
            })
            await stripe.subscriptions.cancel(existingSubscription.stripe_subscription_id)
            
            // Update database to reflect cancellation
            await supabase
              .from('subscriptions')
              .update({ status: 'cancelled' })
              .eq('user_id', userId)
          }
        } catch (error) {
          console.error('Error cancelling existing subscription:', error)
          // Continue with new subscription creation
        }
      }
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          userId: userId,
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const sessionParams: any = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId: userId,
      },
    }

    // Add coupon if provided
    if (couponCode) {
      try {
        // Make coupon code case-insensitive by converting to uppercase
        const normalizedCouponCode = couponCode.toUpperCase()
        const coupon = await stripe.coupons.retrieve(normalizedCouponCode)
        if (coupon.valid) {
          sessionParams.discounts = [
            {
              coupon: normalizedCouponCode,
            },
          ]
        }
      } catch (error) {
        console.error('Invalid coupon code:', error)
        // Continue without coupon
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Checkout session creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}