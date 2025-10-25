import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { initializeNewUser } from '@/lib/user-setup'

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
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError && data.user) {
      // Check if this is a new user (no profile exists)
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .single()

      // If no profile exists, initialize the user
      if (!existingProfile) {
        console.log('New user detected, initializing...')
        try {
          await initializeNewUser(data.user.id, data.user.email || '')
          console.log('✅ User initialization completed')
        } catch (initError) {
          console.error('Error initializing user:', initError)
          // Don't fail the auth flow if initialization fails
        }
      }

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
