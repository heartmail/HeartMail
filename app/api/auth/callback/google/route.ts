import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Use production URL in production, localhost in development
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://heartsmail.com'
    : origin

  if (code) {
    const supabase = createAdminClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('OAuth error:', error)
        return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`)
      }

      if (data.user) {
        // User successfully authenticated
        return NextResponse.redirect(`${baseUrl}${next}`)
      }
    } catch (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`)
}
