'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { signInWithGoogle, signUpWithGoogle, getCurrentSession, signOut as googleSignOut } from './google-oauth-new'

interface AuthContextType {
  user: (User & { avatar_url?: string }) | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, username?: string, firstName?: string, lastName?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signUpWithGoogle: () => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { avatar_url?: string }) | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Simple profile check - non-blocking
  const ensureUserProfile = async (user: User) => {
    // Run in background, don't block login
    setTimeout(async () => {
      try {
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!existingProfile) {
          await supabase.rpc('create_user_profile', {
            p_user_id: user.id,
            p_email: user.email || '',
            p_first_name: user.user_metadata?.first_name || user.user_metadata?.given_name || '',
            p_last_name: user.user_metadata?.last_name || user.user_metadata?.family_name || '',
            p_avatar_url: user.user_metadata?.avatar_url || null
          })
        }
      } catch (error) {
        // Silent fail - don't block user
      }
    }, 0)
    
    return true
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { session, error } = await getCurrentSession()
        
        if (!mounted) return
        
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          // Non-blocking profile check
          ensureUserProfile(session.user)
        } else {
          setUser(null)
          setSession(null)
        }
      } catch (error: any) {
        if (mounted) {
          setUser(null)
          setSession(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return

      if (session?.user) {
        setSession(session)
        setUser(session.user)
        // Non-blocking profile check for new sign-ins
        if (event === 'SIGNED_IN') {
          ensureUserProfile(session.user)
        }
      } else {
        setUser(null)
        setSession(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, username?: string, firstName?: string, lastName?: string) => {
    try {
      console.log('🔄 Creating account for:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      })
      
      if (data.user && !error) {
        console.log('✅ Account created, sending confirmation email...')
        
        try {
          const response = await fetch('/api/auth/send-signup-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, userId: data.user.id })
          })

          if (!response.ok) {
            console.log('ℹ️ Failed to send confirmation email')
          } else {
            console.log('✅ Confirmation email sent')
          }
        } catch (emailError: any) {
          console.log('ℹ️ Email sending error:', emailError.message || emailError)
        }
      }
      
      return { error }
    } catch (error: any) {
      console.log('ℹ️ Sign up exception:', error.message || error)
      return { error: { message: error.message || 'Sign up failed' } }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        return { error }
      }
      
      // Set user immediately for fast UI update
      if (data.session?.user) {
        setUser(data.session.user)
        setSession(data.session)
      }
      
      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message || 'Sign in failed' } }
    }
  }

  const signOut = async () => {
    try {
      console.log('🔄 Signing out...')
      
      const result = await googleSignOut()
      
      if (result.success) {
        console.log('✅ Sign out successful')
      } else {
        console.log('ℹ️ Sign out error:', result.error)
      }
      
      return { error: result.success ? null : { message: result.error } }
    } catch (error: any) {
      console.log('ℹ️ Sign out exception:', error.message || error)
      return { error: { message: error.message || 'Sign out failed' } }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      console.log('🔄 Sending password reset for:', email)
      
      const response = await fetch('/api/auth/send-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log('ℹ️ Password reset error:', errorData)
        return { error: { message: 'Failed to send password reset email' } }
      }

      console.log('✅ Password reset email sent')
      return { error: null }
    } catch (error: any) {
      console.log('ℹ️ Password reset exception:', error.message || error)
      return { error: { message: 'Failed to send password reset email' } }
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      console.log('🔄 Starting Google sign in...')
      const result = await signInWithGoogle()
      
      if (result.success) {
        console.log('✅ Google sign in initiated')
        return { success: true }
      } else {
        console.log('ℹ️ Google sign in failed:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      console.log('ℹ️ Google sign in exception:', error.message || error)
      return { success: false, error: error.message || 'Google sign in failed' }
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      console.log('🔄 Starting Google sign up...')
      const result = await signUpWithGoogle()
      
      if (result.success) {
        console.log('✅ Google sign up initiated')
        return { success: true }
      } else {
        console.log('ℹ️ Google sign up failed:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      console.log('ℹ️ Google sign up exception:', error.message || error)
      return { success: false, error: error.message || 'Google sign up failed' }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle: handleGoogleSignIn,
    signUpWithGoogle: handleGoogleSignUp,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
