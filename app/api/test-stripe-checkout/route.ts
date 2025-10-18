import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Test Stripe connection
    const account = await stripe.accounts.retrieve()
    
    // Test price retrieval
    const familyPrice = await stripe.prices.retrieve('price_1SJ3gL8h6OhnnNXPXyTiD9Yo')
    const extendedPrice = await stripe.prices.retrieve('price_1SJ3gO8h6OhnnNXPY430Z8DW')

    // Test checkout session creation (without actually creating one)
    const testCustomer = await stripe.customers.create({
      email: 'test@example.com',
      metadata: { test: 'true' }
    })

    // Clean up test customer
    await stripe.customers.del(testCustomer.id)

    return NextResponse.json({
      success: true,
      message: 'Stripe checkout integration is working!',
      account: {
        id: account.id,
        country: account.country,
        default_currency: account.default_currency
      },
      prices: {
        family: {
          id: familyPrice.id,
          amount: familyPrice.unit_amount,
          currency: familyPrice.currency,
          interval: familyPrice.recurring?.interval
        },
        extended: {
          id: extendedPrice.id,
          amount: extendedPrice.unit_amount,
          currency: extendedPrice.currency,
          interval: extendedPrice.recurring?.interval
        }
      },
      checkout: 'Ready to create checkout sessions'
    })
  } catch (error: any) {
    console.error('Stripe checkout test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        message: 'Stripe checkout integration failed. Check your API keys and price IDs.'
      },
      { status: 500 }
    )
  }
}
