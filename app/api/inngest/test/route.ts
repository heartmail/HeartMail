import { NextRequest, NextResponse } from 'next/server'
import { inngest } from '@/lib/inngest'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Trigger the test function
    await inngest.send({
      name: 'test/hello',
      data: body.data || { message: 'Hello from HeartMail!' }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test function triggered successfully' 
    })
    
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger test function' },
      { status: 500 }
    )
  }
}
