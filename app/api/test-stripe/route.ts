import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Test Stripe connection
    const products = await stripe.products.list({ limit: 3 })
    
    return NextResponse.json({
      success: true,
      message: 'Stripe connection successful',
      products: products.data.map(p => ({
        id: p.id,
        name: p.name,
        active: p.active
      }))
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
