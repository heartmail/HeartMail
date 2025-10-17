import Link from 'next/link'
import { Heart, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthCodeError() {
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
            There was an error confirming your email. This could be because:
          </p>
          <ul className="text-sm text-gray-600 mt-3 text-left space-y-1">
            <li>• The link has expired</li>
            <li>• The link has already been used</li>
            <li>• The link is invalid</li>
          </ul>
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
