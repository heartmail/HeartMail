import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Testing templates table...')
    
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .limit(10)

    if (error) {
      console.error('❌ Error fetching templates:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 500 })
    }

    console.log('✅ Templates data:', data)
    
    return NextResponse.json({ 
      success: true, 
      templates: data,
      count: data?.length || 0
    })
  } catch (error) {
    console.error('❌ Error in test-templates:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
