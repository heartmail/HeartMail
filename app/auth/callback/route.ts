import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error?error=${error}`)
  }

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      // Check if this is a password reset
      if (type === 'recovery') {
        return NextResponse.redirect(`${requestUrl.origin}/reset-password`)
      }
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    } else {
      console.error('Code exchange error:', exchangeError)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`)
}
