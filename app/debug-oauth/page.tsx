'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugOAuth() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        addLog('🔍 Checking current session...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          addLog(`❌ Session error: ${sessionError.message}`)
        } else if (session) {
          addLog(`✅ Session found: ${session.user?.email}`)
          setSession(session)
          setUser(session.user)
        } else {
          addLog('ℹ️ No active session')
        }

        // Check user profile
        if (session?.user) {
          addLog('🔍 Checking user profile...')
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()

          if (profileError) {
            addLog(`❌ Profile error: ${profileError.message}`)
          } else if (profile) {
            addLog(`✅ Profile found: ${profile.email}`)
          } else {
            addLog('ℹ️ No profile found')
          }
        }
      } catch (error) {
        addLog(`❌ Error: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`🔄 Auth state change: ${event}`)
      if (session) {
        addLog(`✅ User signed in: ${session.user?.email}`)
        setSession(session)
        setUser(session.user)
      } else {
        addLog('ℹ️ User signed out')
        setSession(null)
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const testGoogleOAuth = async () => {
    addLog('🚀 Testing Google OAuth...')
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        addLog(`❌ OAuth error: ${error.message}`)
      } else {
        addLog(`✅ OAuth initiated: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      addLog(`❌ OAuth exception: ${error}`)
    }
  }

  const testDatabaseFunction = async () => {
    addLog('🔍 Testing database function...')
    try {
      const { data, error } = await supabase.rpc('test_oauth_setup')
      if (error) {
        addLog(`❌ DB function error: ${error.message}`)
      } else {
        addLog(`✅ DB function result: ${JSON.stringify(data)}`)
      }
    } catch (error) {
      addLog(`❌ DB function exception: ${error}`)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">OAuth Debug Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Panel */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Current Status</h2>
            
            <div className="space-y-3">
              <div>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
              
              <div>
                <strong>Session:</strong> {session ? 'Active' : 'None'}
              </div>
              
              <div>
                <strong>User:</strong> {user ? user.email : 'None'}
              </div>
              
              <div>
                <strong>User ID:</strong> {user ? user.id : 'None'}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={testGoogleOAuth}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Google OAuth
              </button>
              
              <button
                onClick={testDatabaseFunction}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Database Function
              </button>
            </div>
          </div>

          {/* Logs Panel */}
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
      </div>
    </div>
  )
}
