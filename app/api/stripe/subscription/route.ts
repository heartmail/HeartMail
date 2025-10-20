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

    // If no subscription found, return free plan
    if (!subscription) {
      return NextResponse.json({
        subscription: {
          status: 'free',
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

    // Determine plan name from price ID
    let planName = 'Free'
    if (subscription.stripe_price_id === 'price_1SJ3gL8h6OhnnNXPXyTiD9Yo') {
      planName = 'Family'
    } else if (subscription.stripe_price_id === 'price_1SJ3gO8h6OhnnNXPY430Z8DW') {
      planName = 'Extended Family'
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