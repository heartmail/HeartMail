import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    console.log('🧪 Direct update test: Starting for user:', userId)
    
    const adminSupabase = createAdminClient()
    
    // Direct update without checking current count
    const { error: updateError } = await adminSupabase
      .from('subscription_usage')
      .update({
        emails_sent_this_month: 5, // Set to a specific value
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('month_year', '2025-10')

    if (updateError) {
      console.error('❌ Direct update error:', updateError)
      return NextResponse.json({ 
        error: updateError.message,
        details: updateError
      }, { status: 500 })
    }

    console.log('✅ Direct update successful')

    return NextResponse.json({ 
      success: true, 
      message: 'Direct update successful',
      newValue: 5
    })
  } catch (error: any) {
    console.error('❌ Direct update test error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
