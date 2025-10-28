'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { initializeNewUser } from './user-setup'

interface AuthContextType {
  user: (User & { avatar_url?: string }) | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, username?: string, firstName?: string, lastName?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { avatar_url?: string }) | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async (userId: string) => {
    try {
      // No timeout - let it fail fast if there are issues
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.log('Profile not found or error:', error.message)
        return null
      }

      return profile?.avatar_url
    } catch (error) {
      console.log('Profile fetch failed:', error)
      return null
    }
  }

  useEffect(() => {
    // Get initial session
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        if (session?.user) {
          setUser({ ...session.user, avatar_url: undefined })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error loading session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (session?.user) {
        setUser({ ...session.user, avatar_url: undefined })
        
        // Create user profile if it doesn't exist (for Google OAuth)
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            console.log('🔄 Creating user profile for OAuth user:', session.user.id)
            const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile', {
              p_user_id: session.user.id,
              p_email: session.user.email || '',
              p_first_name: session.user.user_metadata?.first_name || session.user.user_metadata?.given_name || '',
              p_last_name: session.user.user_metadata?.last_name || session.user.user_metadata?.family_name || '',
              p_avatar_url: session.user.user_metadata?.avatar_url || null
            })
            
            if (profileError) {
              console.error('❌ Profile creation RPC error:', profileError)
            } else if (profileResult) {
              console.log('✅ Profile creation result:', profileResult)
              if (profileResult.success) {
                console.log('✅ User profile created/updated successfully')
              } else {
                console.error('❌ Profile creation failed:', profileResult.message, profileResult.error)
              }
            }
          } catch (error) {
            console.error('❌ Profile creation exception:', error)
          }
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, username?: string, firstName?: string, lastName?: string) => {
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
    
    // Send custom confirmation email via Resend if signup was successful
    if (data.user && !error) {
      console.log('✅ User signup successful, sending custom confirmation email via Resend')
      console.log('User ID:', data.user.id)
      console.log('Email:', data.user.email)
      
      try {
        // Send our custom branded confirmation email via Resend
        const response = await fetch('/api/auth/send-signup-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            userId: data.user.id
          })
        })

        if (!response.ok) {
          console.error('Failed to send custom confirmation email via Resend')
          const errorData = await response.json()
          console.error('Error details:', errorData)
        } else {
          console.log('✅ Custom confirmation email sent successfully via Resend')
        }
      } catch (emailError) {
        console.error('Error sending custom confirmation email via Resend:', emailError)
        // Don't fail signup if email sending fails
      }
    }
    
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    try {
      // Send custom password reset email via Resend
      const response = await fetch('/api/auth/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      })

      if (!response.ok) {
        console.error('Failed to send password reset email via Resend')
        const errorData = await response.json()
        console.error('Error details:', errorData)
        return { error: { message: 'Failed to send password reset email' } }
      } else {
        console.log('✅ Password reset email sent successfully via Resend')
        return { error: null }
      }
    } catch (emailError) {
      console.error('Error sending password reset email via Resend:', emailError)
      return { error: { message: 'Failed to send password reset email' } }
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
