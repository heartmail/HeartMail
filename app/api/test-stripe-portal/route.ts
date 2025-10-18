import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Test Stripe connection
    const account = await stripe.accounts.retrieve()
    
    // Test customer portal configuration
    const portalConfigurations = await stripe.billingPortal.configurations.list({
      limit: 1
    })

    return NextResponse.json({
      success: true,
      message: 'Stripe integration is working!',
      account: {
        id: account.id,
        country: account.country,
        default_currency: account.default_currency
      },
      portalConfigurations: portalConfigurations.data.length > 0 ? 'Customer portal is configured' : 'Customer portal needs to be configured'
    })
  } catch (error: any) {
    console.error('Stripe test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        message: 'Stripe integration failed. Check your API keys and configuration.'
      },
      { status: 500 }
    )
  }
}
