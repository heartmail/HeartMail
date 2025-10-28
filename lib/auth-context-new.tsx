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

  // Create user profile if it doesn't exist
  const ensureUserProfile = async (user: User) => {
    try {
      console.log('🔄 Ensuring user profile exists for:', user.email)
      
      const { data: existingProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Error checking profile:', profileError)
        return false
      }

      if (!existingProfile) {
        console.log('🔄 Creating new user profile...')
        
        const { data: profileResult, error: createError } = await supabase.rpc('create_user_profile', {
          p_user_id: user.id,
          p_email: user.email || '',
          p_first_name: user.user_metadata?.first_name || user.user_metadata?.given_name || '',
          p_last_name: user.user_metadata?.last_name || user.user_metadata?.family_name || '',
          p_avatar_url: user.user_metadata?.avatar_url || null
        })

        if (createError) {
          console.error('❌ Error creating profile:', createError)
          return false
        }

        if (profileResult && !profileResult.success) {
          console.error('❌ Profile creation failed:', profileResult.message)
          return false
        }

        console.log('✅ User profile created successfully')
      } else {
        console.log('✅ User profile already exists')
      }

      return true
    } catch (error) {
      console.error('❌ Exception in ensureUserProfile:', error)
      return false
    }
  }

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.log('Profile fetch error (non-critical):', error.message)
        return null
      }

      return profile?.avatar_url
    } catch (error) {
      console.log('Profile fetch exception (non-critical):', error)
      return null
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...')
        
        const { session, error } = await getCurrentSession()
        
        if (error) {
          console.error('❌ Auth initialization error:', error)
          if (mounted) {
            setUser(null)
            setSession(null)
            setLoading(false)
          }
          return
        }

        if (session?.user) {
          console.log('✅ User session found:', session.user.email)
          
          if (mounted) {
            setSession(session)
            setUser({ ...session.user, avatar_url: undefined })
          }

          // Ensure user profile exists
          await ensureUserProfile(session.user)

          // Fetch avatar if needed
          const avatarUrl = await fetchUserProfile(session.user.id)
          if (mounted && avatarUrl) {
            setUser(prev => prev ? { ...prev, avatar_url: avatarUrl } : null)
          }
        } else {
          console.log('ℹ️ No active session')
          if (mounted) {
            setUser(null)
            setSession(null)
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization exception:', error)
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email)
      
      if (!mounted) return

      if (session?.user) {
        setSession(session)
        setUser({ ...session.user, avatar_url: undefined })

        // Handle new sign-ins
        if (event === 'SIGNED_IN') {
          console.log('🔄 New sign-in detected, ensuring profile...')
          await ensureUserProfile(session.user)
          
          // Fetch avatar
          const avatarUrl = await fetchUserProfile(session.user.id)
          if (avatarUrl) {
            setUser(prev => prev ? { ...prev, avatar_url: avatarUrl } : null)
          }
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: username || `user_${Date.now()}`,
            first_name: firstName,
            last_name: lastName,
            display_name: username || firstName || email.split('@')[0]
          }
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
            console.error('❌ Failed to send confirmation email')
          } else {
            console.log('✅ Confirmation email sent')
          }
        } catch (emailError) {
          console.error('❌ Email sending error:', emailError)
        }
      }
      
      return { error }
    } catch (error: any) {
      console.error('❌ Sign up exception:', error)
      return { error: { message: error.message || 'Sign up failed' } }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔄 Signing in:', email)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ Sign in error:', error)
      } else {
        console.log('✅ Sign in successful')
      }
      
      return { error }
    } catch (error: any) {
      console.error('❌ Sign in exception:', error)
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
        console.error('❌ Sign out error:', result.error)
      }
      
      return { error: result.success ? null : { message: result.error } }
    } catch (error: any) {
      console.error('❌ Sign out exception:', error)
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
        console.error('❌ Password reset error:', errorData)
        return { error: { message: 'Failed to send password reset email' } }
      }

      console.log('✅ Password reset email sent')
      return { error: null }
    } catch (error: any) {
      console.error('❌ Password reset exception:', error)
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
        console.error('❌ Google sign in failed:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      console.error('❌ Google sign in exception:', error)
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
        console.error('❌ Google sign up failed:', result.error)
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      console.error('❌ Google sign up exception:', error)
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
