import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getUserLimits } from '@/lib/subscription'

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

    // Get user's subscription and actual recipient count
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_usage (
          emails_sent_this_month
        )
      `)
      .eq('user_id', userId)
      .single()

    // Get actual recipient count from recipients table
    const { count: recipientCount } = await supabase
      .from('recipients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      )
    }

    // If no subscription found, return free plan without creating database record
    if (!subscription) {
      console.log('No subscription found, returning free plan for user:', userId)
      
      // Get actual recipient count for free plan users too
      const { count: freeRecipientCount } = await supabase
        .from('recipients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true)
      
      const limits = await getUserLimits(userId)
      return NextResponse.json({
        subscription: {
          status: 'active',
          plan: 'Free',
          price_id: null,
          current_period_start: null,
          current_period_end: null,
          cancel_at_period_end: false,
          usage: {
            recipients_created: freeRecipientCount || 0,
            emails_sent_this_month: 0
          }
        },
        limits
      })
    }

    // Determine plan name from plan field
    let planName = 'Free'
    if (subscription.plan === 'family') {
      planName = 'Family'
    } else if (subscription.plan === 'extended') {
      planName = 'Extended'
    }

    // Get user limits based on their subscription
    const limits = await getUserLimits(userId)

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: planName,
        price_id: subscription.stripe_price_id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        usage: {
          recipients_created: recipientCount || 0,
          emails_sent_this_month: subscription.subscription_usage?.[0]?.emails_sent_this_month || 0
        }
      },
      limits
    })
  } catch (error: any) {
    console.error('Subscription fetch failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}