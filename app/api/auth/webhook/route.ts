import { NextRequest, NextResponse } from 'next/server'
import { initializeNewUser } from '@/lib/user-setup'

export async function POST(req: NextRequest) {
  try {
    const { type, record } = await req.json()

    // Handle new user signup
    if (type === 'INSERT' && record?.id) {
      console.log('New user created:', record.id)
      
      // Initialize user with default data
      const result = await initializeNewUser(record.id, record.email)
      
      if (result.success) {
        console.log('User initialization successful')
        return NextResponse.json({ success: true })
      } else {
        console.error('User initialization failed:', result.error)
        return NextResponse.json({ error: 'User initialization failed' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
