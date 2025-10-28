'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDBFunction() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testOAuthSetup = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('test_oauth_setup')
      setResult({ data, error })
    } catch (err) {
      setResult({ error: err })
    } finally {
      setLoading(false)
    }
  }

  const testCreateProfile = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('create_user_profile', {
        p_user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
        p_email: 'test@example.com',
        p_first_name: 'Test',
        p_last_name: 'User',
        p_avatar_url: null
      })
      setResult({ data, error })
    } catch (err) {
      setResult({ error: err })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Database Function Test</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <div className="space-y-4">
          <button
            onClick={testOAuthSetup}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test OAuth Setup Function'}
          </button>
          
          <button
            onClick={testCreateProfile}
            disabled={loading}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Create Profile Function'}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
