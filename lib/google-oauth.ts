import { supabase } from './supabase'

export const signInWithGoogle = async () => {
  // Use production URL in production, localhost in development
  const redirectUrl = process.env.NODE_ENV === 'production' 
    ? 'https://heartsmail.com/api/auth/callback/google'
    : `${window.location.origin}/api/auth/callback/google`
    
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('Google OAuth error:', error)
    throw error
  }

  return data
}

export const getGoogleAuthUrl = () => {
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback/google`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })

  return `${baseUrl}?${params.toString()}`
}
