import { NextResponse } from 'next/server'

export async function GET() {
  // Only show in development or if explicitly enabled
  if (process.env.NODE_ENV !== 'development' && process.env.ENABLE_DEBUG !== 'true') {
    return NextResponse.json({ error: 'Debug endpoint disabled in production' }, { status: 403 })
  }

  return NextResponse.json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    // Don't expose actual secrets, just confirm they exist
    GOOGLE_CLIENT_ID_PREFIX: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
    GOOGLE_CLIENT_SECRET_PREFIX: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10) + '...',
  })
}
