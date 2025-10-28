'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestOAuthSimple() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testOAuth = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🔄 Testing OAuth with current configuration...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      console.log('OAuth result:', { data, error })
      setResult({ data, error })
    } catch (error) {
      console.error('OAuth exception:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Simple OAuth Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <button
            onClick={testOAuth}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Google OAuth'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-bold mb-2">What to look for:</h3>
            <ul className="text-sm space-y-1">
              <li>• If successful: You'll be redirected to Google</li>
              <li>• If error: Check the error message for clues</li>
              <li>• Check browser console for detailed logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
