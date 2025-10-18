'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestInngestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testInngest = async () => {
    setLoading(true)
    setResult('')
    
    try {
      const response = await fetch('/api/inngest/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'test/hello',
          data: {
            message: 'Hello from HeartMail!',
            timestamp: new Date().toISOString()
          }
        })
      })

      if (response.ok) {
        setResult('✅ Inngest test function triggered successfully!')
      } else {
        setResult('❌ Failed to trigger Inngest function')
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Inngest Test</CardTitle>
            <CardDescription>
              Test your Inngest setup by triggering a simple function
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testInngest} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Inngest Function'}
            </Button>
            
            {result && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <p className="text-sm font-mono">{result}</p>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p><strong>Instructions:</strong></p>
              <ol className="list-decimal list-inside space-y-1 mt-2">
                <li>Make sure Inngest dev server is running: <code>npx inngest-cli@latest dev</code></li>
                <li>Open the dev server at <code>http://localhost:8288</code></li>
                <li>Click the test button above</li>
                <li>Check the dev server to see the function execution</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
