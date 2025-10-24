import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get all active subscriptions for this user
    const { data: activeSubscriptions, error } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, created_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (!activeSubscriptions || activeSubscriptions.length <= 1) {
      return NextResponse.json({
        message: 'No duplicate subscriptions found',
        count: activeSubscriptions?.length || 0
      })
    }

    // Keep the most recent subscription, cancel the rest
    const [keepSubscription, ...duplicates] = activeSubscriptions
    let cancelledCount = 0

    for (const duplicate of duplicates) {
      try {
        // Cancel in Stripe
        await stripe.subscriptions.cancel(duplicate.stripe_subscription_id)
        
        // Update database
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', duplicate.stripe_subscription_id)
        
        cancelledCount++
        console.log('Cancelled duplicate subscription:', duplicate.stripe_subscription_id)
      } catch (error) {
        console.error('Error cancelling subscription:', duplicate.stripe_subscription_id, error)
      }
    }

    return NextResponse.json({
      message: `Successfully cancelled ${cancelledCount} duplicate subscriptions`,
      kept: keepSubscription.stripe_subscription_id,
      cancelled: cancelledCount
    })

  } catch (error: any) {
    console.error('Cleanup duplicates error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup duplicates' },
      { status: 500 }
    )
  }
}
