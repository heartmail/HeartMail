'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugOAuthComplete() {
  const [logs, setLogs] = useState<string[]>([])
  const [envCheck, setEnvCheck] = useState<any>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    addLog('🔍 Starting comprehensive OAuth debug...')
    
    // Check environment variables
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    
    addLog(`📋 Client ID: ${clientId ? 'SET' : 'NOT_SET'}`)
    addLog(`📋 App URL: ${appUrl || 'NOT_SET'}`)
    
    if (clientId) {
      addLog(`📋 Client ID value: ${clientId}`)
      const expectedClientId = process.env.NODE_ENV === 'production' 
        ? '329473569521-bh3drhgft02l303vbmqndaj2j3r3glib.apps.googleusercontent.com'
        : 'local-dev-client-id'
      if (clientId === expectedClientId) {
        addLog('✅ Client ID matches expected value')
      } else {
        addLog('❌ Client ID does NOT match expected value')
      }
    }
  }, [])

  const testSupabaseConnection = async () => {
    addLog('🔍 Testing Supabase connection...')
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
      if (error) {
        addLog(`❌ Supabase error: ${error.message}`)
      } else {
        addLog('✅ Supabase connection successful')
      }
    } catch (error: any) {
      addLog(`❌ Supabase exception: ${error.message}`)
    }
  }

  const testGoogleOAuth = async () => {
    addLog('🚀 Testing Google OAuth initiation...')
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        addLog(`❌ OAuth initiation error: ${error.message}`)
      } else {
        addLog(`✅ OAuth initiated successfully: ${JSON.stringify(data)}`)
      }
    } catch (error: any) {
      addLog(`❌ OAuth exception: ${error.message}`)
    }
  }

  const checkServerEnv = async () => {
    addLog('🔍 Checking server environment variables...')
    try {
      const response = await fetch('/api/debug-env')
      const data = await response.json()
      
      if (response.ok) {
        addLog('✅ Server env check successful')
        addLog(`📋 GOOGLE_CLIENT_ID: ${data.GOOGLE_CLIENT_ID}`)
        addLog(`📋 GOOGLE_CLIENT_SECRET: ${data.GOOGLE_CLIENT_SECRET}`)
        addLog(`📋 GOOGLE_CLIENT_ID_PREFIX: ${data.GOOGLE_CLIENT_ID_PREFIX}`)
        addLog(`📋 GOOGLE_CLIENT_SECRET_PREFIX: ${data.GOOGLE_CLIENT_SECRET_PREFIX}`)
        setEnvCheck(data)
      } else {
        addLog(`❌ Server env check failed: ${data.error}`)
      }
    } catch (error: any) {
      addLog(`❌ Server env check exception: ${error.message}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Complete OAuth Debug</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Debug Actions</h2>
            
            <div className="space-y-3">
              <button
                onClick={testSupabaseConnection}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Supabase Connection
              </button>
              
              <button
                onClick={testGoogleOAuth}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Google OAuth Initiation
              </button>
              
              <button
                onClick={checkServerEnv}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Check Server Environment
              </button>
              
              <button
                onClick={clearLogs}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear Logs
              </button>
            </div>

            {envCheck && (
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h3 className="font-bold mb-2">Server Environment Status:</h3>
                <div className="text-sm space-y-1">
                  <div>GOOGLE_CLIENT_ID: {envCheck.GOOGLE_CLIENT_ID}</div>
                  <div>GOOGLE_CLIENT_SECRET: {envCheck.GOOGLE_CLIENT_SECRET}</div>
                  <div>ID Prefix: {envCheck.GOOGLE_CLIENT_ID_PREFIX}</div>
                  <div>Secret Prefix: {envCheck.GOOGLE_CLIENT_SECRET_PREFIX}</div>
                </div>
              </div>
            )}
          </div>

          {/* Logs */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Debug Logs</h2>
              <button
                onClick={clearLogs}
                className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Expected Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-bold mb-2">Client-Side (NEXT_PUBLIC_*)</h3>
              <ul className="space-y-1">
                <li>NEXT_PUBLIC_GOOGLE_CLIENT_ID: [Check debug output above]</li>
                <li>NEXT_PUBLIC_APP_URL: https://heartsmail.com</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">Server-Side</h3>
              <ul className="space-y-1">
                <li>GOOGLE_CLIENT_ID: [Check server env debug above]</li>
                <li>GOOGLE_CLIENT_SECRET: [Check server env debug above]</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
