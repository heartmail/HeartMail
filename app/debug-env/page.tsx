'use client'

import { useState, useEffect } from 'react'

export default function DebugEnv() {
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    // Get environment variables that are available on the client side
    setEnvVars({
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Environment Variables Debug</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Client-Side Environment Variables</h2>
          
          <div className="space-y-3">
            <div>
              <strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID:</strong>
              <div className="bg-gray-100 p-2 rounded font-mono text-sm mt-1">
                {envVars.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'NOT_FOUND'}
              </div>
            </div>
            
            <div>
              <strong>NEXT_PUBLIC_APP_URL:</strong>
              <div className="bg-gray-100 p-2 rounded font-mono text-sm mt-1">
                {envVars.NEXT_PUBLIC_APP_URL || 'NOT_FOUND'}
              </div>
            </div>
            
            <div>
              <strong>NODE_ENV:</strong>
              <div className="bg-gray-100 p-2 rounded font-mono text-sm mt-1">
                {envVars.NODE_ENV || 'NOT_FOUND'}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-bold mb-2">Expected Values:</h3>
            <ul className="text-sm space-y-1">
              <li><strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID:</strong> 329473569521-bh3drhgft02l303vbmqndaj2j3r3glib.apps.googleusercontent.com</li>
              <li><strong>NEXT_PUBLIC_APP_URL:</strong> https://heartsmail.com</li>
              <li><strong>NODE_ENV:</strong> production</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded">
            <h3 className="font-bold mb-2">Note:</h3>
            <p className="text-sm">
              Server-side environment variables (GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID) are not visible on the client side for security reasons. 
              If the client-side variables are correct but OAuth still fails, the issue is likely with the server-side variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
