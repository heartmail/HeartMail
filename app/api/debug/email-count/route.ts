import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    
    // Get current month
    const now = new Date()
    const utcYear = now.getUTCFullYear()
    const utcMonth = now.getUTCMonth() + 1
    const currentMonth = `${utcYear}-${String(utcMonth).padStart(2, '0')}`
    
    // Get all usage records for this user
    const { data: allUsage, error: allUsageError } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('user_id', userId)
      .order('month_year', { ascending: false })
    
    // Get current month usage
    const { data: currentUsage, error: currentUsageError } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single()
    
    return NextResponse.json({
      userId,
      currentMonth,
      allUsage: allUsage || [],
      currentUsage: currentUsage || null,
      allUsageError,
      currentUsageError
    })
  } catch (error: any) {
    console.error('Debug email count error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
