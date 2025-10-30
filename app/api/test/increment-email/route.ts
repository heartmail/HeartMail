import { NextRequest, NextResponse } from 'next/server'
import { incrementEmailCount } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    console.log('🧪 Test: About to increment email count for user:', userId)
    
    await incrementEmailCount(userId)
    
    console.log('🧪 Test: Email count incremented successfully for user:', userId)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email count incremented successfully' 
    })
  } catch (error: any) {
    console.error('🧪 Test: Error incrementing email count:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
