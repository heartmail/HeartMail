import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    
    // Get user's subscription
    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
    }

    const planName = subscription?.plan || 'free'

    // Get plan limits from database
    const { data: plan, error: planError } = await adminSupabase
      .from('plans')
      .select('recipients_limit')
      .eq('name', planName)
      .eq('is_active', true)
      .single()

    let recipientsLimit = 2 // Default for free plan
    if (!planError && plan) {
      recipientsLimit = plan.recipients_limit || 2
    }

    // Get current recipient count
    const { count: currentRecipients, error: countError } = await adminSupabase
      .from('recipients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (countError) {
      console.error('Error fetching recipient count:', countError)
      return NextResponse.json({ error: 'Failed to fetch recipient count' }, { status: 500 })
    }

    const canAdd = recipientsLimit === null || (currentRecipients || 0) < recipientsLimit

    return NextResponse.json({ 
      canAdd, 
      currentCount: currentRecipients || 0, 
      limit: recipientsLimit 
    })

  } catch (error) {
    console.error('Error in check recipient limit API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
