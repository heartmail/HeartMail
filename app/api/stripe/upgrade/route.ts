import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId, priceId, newPriceId, customerEmail } = await request.json()

    // Use priceId if newPriceId is not provided (for backward compatibility)
    const targetPriceId = newPriceId || priceId

    if (!userId || !targetPriceId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, priceId, customerEmail' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get current subscription
    const { data: currentSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cancel current subscription
    if (currentSubscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(currentSubscription.stripe_subscription_id)
        console.log('Cancelled current subscription:', currentSubscription.stripe_subscription_id)
      } catch (error) {
        console.error('Error cancelling current subscription:', error)
      }
    }

    // Create new checkout session for upgrade
    const sessionParams: any = {
      customer: currentSubscription.stripe_customer_id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: targetPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?upgrade=canceled`,
      metadata: {
        userId: userId,
        upgrade: 'true',
      },
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error: any) {
    console.error('Upgrade process failed:', error)
    return NextResponse.json(
      { error: 'Failed to process upgrade' },
      { status: 500 }
    )
  }
}
