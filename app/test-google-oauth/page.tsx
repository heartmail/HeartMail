'use client'

import { signInWithGoogle } from '@/lib/google-oauth'
import { Button } from '@/components/ui/button'

export default function TestGoogleOAuth() {
  const handleGoogleSignIn = async () => {
    try {
      console.log('Testing Google OAuth...')
      await signInWithGoogle()
      console.log('Google OAuth initiated successfully')
    } catch (error) {
      console.error('Google OAuth error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Test Google OAuth</h1>
        <Button onClick={handleGoogleSignIn} className="btn-heartmail">
          Test Google Sign In
        </Button>
        <p className="text-sm text-gray-600 mt-4">
          Check the console for any errors
        </p>
      </div>
    </div>
  )
}
