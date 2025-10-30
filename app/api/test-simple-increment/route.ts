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

    console.log('🧪 Simple test: Starting increment for user:', userId)
    
    const adminSupabase = createAdminClient()
    
    // Get current count
    const { data: currentUsage, error: fetchError } = await adminSupabase
      .from('subscription_usage')
      .select('emails_sent_this_month')
      .eq('user_id', userId)
      .eq('month_year', '2025-10')
      .single()

    if (fetchError) {
      console.error('❌ Error fetching current usage:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const currentCount = currentUsage?.emails_sent_this_month || 0
    const newCount = currentCount + 1

    console.log('🧪 Current count:', currentCount, 'New count:', newCount)

    // Update the count
    const { error: updateError } = await adminSupabase
      .from('subscription_usage')
      .update({
        emails_sent_this_month: newCount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('month_year', '2025-10')

    if (updateError) {
      console.error('❌ Error updating count:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log('✅ Successfully updated count to:', newCount)

    return NextResponse.json({ 
      success: true, 
      oldCount: currentCount,
      newCount: newCount
    })
  } catch (error: any) {
    console.error('❌ Simple test error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
