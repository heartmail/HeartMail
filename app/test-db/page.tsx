'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDB() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Test basic connection
      const { data, error } = await supabase.from('recipients').select('count').limit(1)
      if (error) {
        setResult(`Error: ${error.message}`)
      } else {
        setResult('✅ Database connection successful!')
      }
    } catch (err) {
      setResult(`❌ Connection failed: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testTables = async () => {
    setLoading(true)
    try {
      // Test recipients table
      const { data: recipients, error: recipientsError } = await supabase
        .from('recipients')
        .select('*')
        .limit(1)
      
      // Test templates table
      const { data: templates, error: templatesError } = await supabase
        .from('templates')
        .select('*')
        .limit(1)

      let result = 'Database Tables Test:\n'
      result += `Recipients table: ${recipientsError ? `❌ ${recipientsError.message}` : '✅ OK'}\n`
      result += `Templates table: ${templatesError ? `❌ ${templatesError.message}` : '✅ OK'}\n`
      
      setResult(result)
    } catch (err) {
      setResult(`❌ Test failed: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Connection
        </button>
        
        <button 
          onClick={testTables}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          Test Tables
        </button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}
