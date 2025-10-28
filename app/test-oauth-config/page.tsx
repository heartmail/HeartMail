'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestOAuthConfig() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const testOAuth = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('🔄 Testing Google OAuth configuration...')
      
      // Test the OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      console.log('OAuth result:', { data, error })
      
      if (error) {
        setError(`OAuth Error: ${error.message}`)
      } else {
        console.log('✅ OAuth initiated successfully')
      }
    } catch (err: any) {
      console.error('OAuth exception:', err)
      setError(`Exception: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkConfig = async () => {
    try {
      // Try to get current session to test connection
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setError(`Session Error: ${error.message}`)
      } else {
        console.log('✅ Supabase connection working')
        setConfig({
          session: session ? 'Active' : 'None',
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        })
      }
    } catch (err: any) {
      setError(`Config Error: ${err.message}`)
    }
  }

  useEffect(() => {
    checkConfig()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">OAuth Configuration Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Supabase URL:</strong> {config?.supabaseUrl || 'Loading...'}</p>
              <p><strong>Google Client ID:</strong> {config?.googleClientId || 'Loading...'}</p>
              <p><strong>Session Status:</strong> {config?.session || 'Loading...'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test OAuth Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testOAuth}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Google OAuth'}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
