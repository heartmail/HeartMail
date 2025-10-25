import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()
    
    // Use UTC date to avoid system clock issues
    const now = new Date()
    const utcYear = now.getUTCFullYear()
    const utcMonth = now.getUTCMonth() + 1
    const currentMonth = `${utcYear}-${String(utcMonth).padStart(2, '0')}`
    
    console.log('incrementRecipientCount API - Current month (UTC):', currentMonth)
    
    // First, get the current usage record
    const { data: currentUsage, error: fetchError } = await adminSupabase
      .from('subscription_usage')
      .select('emails_sent_this_month, recipients_created')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching current usage:', fetchError)
      throw fetchError
    }

    const currentEmailCount = currentUsage?.emails_sent_this_month || 0
    const currentRecipientCount = currentUsage?.recipients_created || 0

    // Update or insert the usage record
    const { error: upsertError } = await adminSupabase
      .from('subscription_usage')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        emails_sent_this_month: currentEmailCount, // Keep existing email count
        recipients_created: currentRecipientCount + 1, // Increment recipient count
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      console.error('Error incrementing recipient count:', upsertError)
      throw upsertError
    }

    console.log('✅ Recipient count incremented successfully for user:', userId)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in incrementRecipientCount API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
