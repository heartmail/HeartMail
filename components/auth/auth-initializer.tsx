'use client'

import { useEffect } from 'react'
import { useAuthState } from '@/lib/use-auth-state'

interface AuthInitializerProps {
  children: React.ReactNode
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const { user, loading } = useAuthState()

  useEffect(() => {
    // Force a re-render when auth state changes
    if (!loading) {
      // Auth state is ready, trigger any necessary updates
      console.log('Auth state ready:', { user: !!user, loading })
    }
  }, [user, loading])

  return <>{children}</>
}
