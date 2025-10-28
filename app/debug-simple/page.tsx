'use client'

import { useState, useEffect } from 'react'

export default function DebugSimple() {
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    setEnvVars({
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Simple Environment Debug</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Current Environment Variables</h2>
          
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
              <li><strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID:</strong> Should start with "329473569521-bh3drhgft02l303vbmqndaj2j3r3glib"</li>
              <li><strong>NEXT_PUBLIC_APP_URL:</strong> Should be "https://heartsmail.com"</li>
              <li><strong>NODE_ENV:</strong> Should be "production"</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded">
            <h3 className="font-bold mb-2">Next Steps:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Check if the client ID matches the expected pattern</li>
              <li>If not, update Vercel environment variables</li>
              <li>Redeploy the application</li>
              <li>Test Google OAuth again</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
