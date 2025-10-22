'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

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
    // Get initial session with timeout
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        if (session?.user) {
          // Set user immediately without waiting for profile
          setUser({ ...session.user, avatar_url: null })
          
          // Fetch profile in background - don't await
          fetchUserProfile(session.user.id).then(avatarUrl => {
            setUser(prev => prev ? { ...prev, avatar_url: avatarUrl } : null)
          }).catch(error => {
            console.log('Background profile fetch failed:', error)
          })
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
        // Set user immediately without waiting for profile
        setUser({ ...session.user, avatar_url: null })
        
        // Fetch profile in background - don't await
        fetchUserProfile(session.user.id).then(avatarUrl => {
          setUser(prev => prev ? { ...prev, avatar_url: avatarUrl } : null)
        }).catch(error => {
          console.log('Background profile fetch failed:', error)
        })
      } else {
        setUser(null)
      }
      setLoading(false)
      
      // Initialize user data if this is a new signup
      if (event === 'SIGNED_UP' as any && session?.user) {
        try {
          const response = await fetch('/api/auth/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'INSERT',
              record: { id: session.user.id, email: session.user.email }
            })
          })
          
          if (!response.ok) {
            console.error('Failed to initialize user data')
          }
        } catch (error) {
          console.error('Error initializing user:', error)
        }
      }
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
    
    // Create profile and username after successful signup
    if (data.user && !error) {
      try {
        // Create user profile
        await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          email: data.user.email,
          first_name: firstName,
          last_name: lastName,
          bio: ''
        })

        // Add username to usernames table if provided
        if (username) {
          const { error: usernameError } = await supabase
            .rpc('add_username', { 
              user_uuid: data.user.id, 
              username_text: username 
            })
          
          if (usernameError) {
            console.error('Error adding username:', usernameError)
          }
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError)
        // Don't fail signup if profile creation fails
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
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
