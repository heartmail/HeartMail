'use client'

import Link from 'next/link'
import { Heart, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'

export default function AuthCodeError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  const getErrorMessage = () => {
    switch (error) {
      case 'access_denied':
        return 'You cancelled the authentication process. Please try again.'
      case 'invalid_request':
        return 'The authentication request was invalid. Please try again.'
      case 'server_error':
        return 'There was a server error during authentication. Please try again.'
      default:
        return 'There was an error during authentication. This could be because:'
    }
  }

  const getErrorDetails = () => {
    if (error) {
      return null // Don't show bullet points for specific OAuth errors
    }
    return (
      <ul className="text-sm text-gray-600 mt-3 text-left space-y-1">
        <li>• The link has expired</li>
        <li>• The link has already been used</li>
        <li>• The link is invalid</li>
      </ul>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl border-0 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
          <Heart className="h-8 w-8 text-heartmail-pink fill-heartmail-pink" />
          <span className="text-2xl font-bold text-heartmail-pink">HeartMail</span>
        </Link>
        
        <div className="mb-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600">
            {getErrorMessage()}
          </p>
          {getErrorDetails()}
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full btn-heartmail">
            <Link href="/login">Try Signing In</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/signup">Create New Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
