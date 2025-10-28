import { supabase } from './supabase'

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      console.error('Google OAuth error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Google OAuth signin error:', error)
    throw error
  }
}

export const signUpWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      console.error('Google OAuth signup error:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Google OAuth signup error:', error)
    throw error
  }
}