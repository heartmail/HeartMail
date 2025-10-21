import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get user's subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_usage (
          recipients_count,
          templates_used,
          emails_sent_this_month
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      )
    }

    // If no subscription found, create a default free subscription
    if (!subscription) {
      console.log('No subscription found, creating default free subscription for user:', userId)
      const { data: newSubscription, error: createError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: 'free',
          status: 'active'
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating default subscription:', createError)
        return NextResponse.json({
          subscription: {
            status: 'active',
            plan: 'Free',
            price_id: null,
            current_period_start: null,
            current_period_end: null,
            cancel_at_period_end: false,
            usage: {
              recipients_count: 0,
              templates_used: 0,
              emails_sent_this_month: 0
            }
          }
        })
      }

      return NextResponse.json({
        subscription: {
          id: newSubscription.id,
          status: newSubscription.status,
          plan: 'Free',
          price_id: newSubscription.plan_id,
          current_period_start: newSubscription.current_period_start,
          current_period_end: newSubscription.current_period_end,
          cancel_at_period_end: newSubscription.cancel_at_period_end,
          usage: {
            recipients_count: 0,
            templates_used: 0,
            emails_sent_this_month: 0
          }
        }
      })
    }

    // Determine plan name from plan field
    let planName = 'Free'
    if (subscription.plan === 'pro') {
      planName = 'Pro'
    } else if (subscription.plan === 'premium') {
      planName = 'Premium'
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: planName,
        price_id: subscription.stripe_price_id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        usage: subscription.subscription_usage?.[0] || {
          recipients_count: 0,
          templates_used: 0,
          emails_sent_this_month: 0
        }
      }
    })
  } catch (error: any) {
    console.error('Subscription fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}