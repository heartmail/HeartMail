'use client'

import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let mounted = true

    // Get initial session immediately
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (mounted) {
          if (error) {
            console.error('Error getting session:', error)
            setUser(null)
            setSession(null)
            setIsAuthenticated(false)
          } else {
            setSession(session)
            setUser(session?.user || null)
            setIsAuthenticated(!!session?.user)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          setUser(null)
          setSession(null)
          setIsAuthenticated(false)
          setLoading(false)
        }
      }
    }

    // Get initial session
    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session)
          setUser(session?.user || null)
          setIsAuthenticated(!!session?.user)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    session,
    loading,
    isAuthenticated
  }
}
