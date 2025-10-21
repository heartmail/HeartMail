import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId } = await request.json()

    if (!priceId || !userId) {
      return NextResponse.json({ error: 'Missing priceId or userId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get the user's email for pre-filling checkout
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !user) {
      console.error('Error fetching user for checkout:', userError?.message)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if the user already has a Stripe customer ID
    let customerId: string | null = null
    
    // First check subscriptions table
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error fetching subscription for customer ID:', subscriptionError.message)
    }

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id
    } else {
      // Check profiles table as fallback
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile for customer ID:', profileError.message)
      }

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id
      }
    }

    if (!customerId) {
      // Create a new Stripe customer if one doesn't exist
      console.log('Creating new Stripe customer for user:', user.email)
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: userId,
        },
      })
      customerId = customer.id

      // Save the new customer ID to both tables
      const { error: updateSubscriptionError } = await supabase
        .from('subscriptions')
        .upsert({ 
          user_id: userId,
          stripe_customer_id: customerId,
          plan: 'free',
          status: 'active'
        })

      if (updateSubscriptionError) {
        console.error('Error updating subscription with Stripe customer ID:', updateSubscriptionError.message)
      }

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId,
          stripe_customer_id: customerId 
        })

      if (updateProfileError) {
        console.error('Error updating profile with Stripe customer ID:', updateProfileError.message)
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId || undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/dashboard/settings?tab=billing&success=true`,
      cancel_url: `${request.headers.get('origin')}/dashboard/settings?tab=billing&cancelled=true`,
      metadata: {
        userId: userId,
        priceId: priceId,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout session creation error:', error)
    return NextResponse.json(
      { error: `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
