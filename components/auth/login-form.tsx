'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import Logo from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { signInWithGoogle } from '@/lib/google-oauth'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const { error } = await signIn(formData.email, formData.password)
    
    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError('')

    try {
      await signInWithGoogle()
      // The redirect will happen automatically
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google')
      setIsGoogleLoading(false)
    }
  }

  return (
    <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0 w-full max-w-lg">
      <CardHeader className="text-center">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
          <Logo size={32} className="h-8 w-8" />
          <span className="text-2xl font-bold text-heartmail-pink">HeartMail</span>
        </Link>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to continue connecting hearts</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-sm text-heartmail-pink hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full btn-heartmail" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>


          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-heartmail-pink hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
