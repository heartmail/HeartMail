// Test page to verify Google OAuth client ID
import { useEffect, useState } from 'react'

export default function TestOAuth() {
  const [clientId, setClientId] = useState('')

  useEffect(() => {
    setClientId(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'NOT_FOUND')
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Google OAuth Client ID Test</h1>
      <p><strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID:</strong> {clientId}</p>
      <p><strong>Expected:</strong> 329473569521-bh3drhgft02l303vbmqndaj2j3r3glib.apps.googleusercontent.com</p>
      <p><strong>Old (deleted):</strong> 329473569521-b7o6cdt9nq4henlu3bmdq772np2hv2tj.apps.googleusercontent.com</p>
      
      {clientId === '329473569521-bh3drhgft02l303vbmqndaj2j3r3glib.apps.googleusercontent.com' ? (
        <p style={{ color: 'green' }}>✅ CORRECT CLIENT ID</p>
      ) : (
        <p style={{ color: 'red' }}>❌ WRONG CLIENT ID - Environment variable not updated</p>
      )}
    </div>
  )
}
