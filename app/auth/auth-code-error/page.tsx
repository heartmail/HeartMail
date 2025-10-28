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
    <div className="min-h-screen flex items-center justify-center heartmail-gradient relative overflow-hidden">
      {/* Floating Hearts */}
      <div className="floating-hearts">
        <div className="floating-heart">💖</div>
        <div className="floating-heart">💕</div>
        <div className="floating-heart">💗</div>
        <div className="floating-heart">💝</div>
        <div className="floating-heart">💘</div>
        <div className="floating-heart">💖</div>
        <div className="floating-heart">💕</div>
        <div className="floating-heart">💗</div>
      </div>
      
      <div className="relative z-10 bg-white/95 backdrop-blur-md shadow-2xl border-0 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
          <Heart className="h-8 w-8 text-heartmail-pink fill-heartmail-pink" />
          <span className="text-2xl font-bold text-heartmail-pink">HeartMail</span>
        </Link>
        
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            {getErrorMessage()}
          </p>
          {getErrorDetails()}
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full btn-heartmail h-12 text-lg font-semibold">
            <Link href="/login">Try Signing In</Link>
          </Button>
          <Button asChild variant="outline" className="w-full h-12 text-lg font-semibold border-2 hover:bg-gray-50">
            <Link href="/signup">Create New Account</Link>
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Need help?</strong> If this error persists, please check that your Google account is properly configured or try using email/password authentication instead.
          </p>
        </div>
      </div>
    </div>
  )
}
