import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('templates').select('*').limit(1)
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        message: 'Supabase connection failed' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful!',
      data: data
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      message: 'Check your environment variables'
    }, { status: 500 })
  }
}
