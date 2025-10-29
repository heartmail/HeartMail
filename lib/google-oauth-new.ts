import { supabase } from './supabase'

export interface GoogleOAuthResult {
  success: boolean
  error?: string
  data?: any
}

/**
 * Sign in with Google OAuth
 * Uses Supabase's native OAuth flow with proper error handling
 */
export const signInWithGoogle = async (): Promise<GoogleOAuthResult> => {
  try {
    console.log('🔄 Starting Google OAuth sign in...')
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.log('ℹ️ Google OAuth error:', error.message)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    console.log('✅ Google OAuth initiated successfully')
    return {
      success: true,
      error: undefined,
      data
    }
  } catch (error: any) {
    console.log('ℹ️ Google OAuth exception:', error.message || error)
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      data: null
    }
  }
}

/**
 * Sign up with Google OAuth
 * Uses the same flow as sign in (Google doesn't distinguish between sign in/up)
 */
export const signUpWithGoogle = async (): Promise<GoogleOAuthResult> => {
  console.log('🔄 Starting Google OAuth sign up...')
  return await signInWithGoogle() // Same implementation
}

/**
 * Check if user has an active session
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('ℹ️ Session error:', error.message)
      return { session: null, error }
    }

    console.log('✅ Session retrieved:', session ? 'Active' : 'None')
    return { session, error: null }
  } catch (error: any) {
    console.log('ℹ️ Session exception:', error.message || error)
    return { session: null, error }
  }
}

/**
 * Sign out user
 */
export const signOut = async (): Promise<GoogleOAuthResult> => {
  try {
    console.log('🔄 Signing out user...')
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.log('ℹ️ Sign out error:', error.message)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    console.log('✅ User signed out successfully')
    return {
      success: true,
      error: undefined,
      data: null
    }
  } catch (error: any) {
    console.log('ℹ️ Sign out exception:', error.message || error)
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      data: null
    }
  }
}
