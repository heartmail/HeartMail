import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get current usage data
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    const { data: usage, error } = await supabase
      .from('subscription_usage')
      .select('emails_sent_this_month, recipients_count')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching usage data:', error)
      return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      usage: {
        emails_sent_this_month: usage?.emails_sent_this_month || 0,
        recipients_count: usage?.recipients_count || 0
      }
    })

  } catch (error) {
    console.error('Error in refresh-dashboard API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
