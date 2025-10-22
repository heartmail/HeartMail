import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get user's Stripe customer ID
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId: string

    if (error || !subscription?.stripe_customer_id) {
      // No Stripe customer found - create one for the user
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
      if (userError || !user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.user.email,
        metadata: {
          supabase_user_id: userId,
        },
      })
      customerId = customer.id

      // Save the customer ID to the database
      await supabase
        .from('subscriptions')
        .upsert({ 
          user_id: userId,
          stripe_customer_id: customerId,
          plan: 'free',
          status: 'active'
        })
    } else {
      customerId = subscription.stripe_customer_id
    }

            // Create customer portal session with default configuration
            const portalSession = await stripe.billingPortal.sessions.create({
              customer: customerId,
              return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?tab=billing`,
              // Using default configuration - no custom config needed
            })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Customer portal creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    )
  }
}
