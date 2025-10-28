'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, Check, Heart } from 'lucide-react'
import Logo from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context-new'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const { signUp, signUpWithGoogle } = useAuth()
  const router = useRouter()

  const steps = [
    { id: 1, title: 'Name', description: 'Tell us your name', icon: User },
    { id: 2, title: 'Username', description: 'Choose your username', icon: User },
    { id: 3, title: 'Email', description: 'Enter your email', icon: Mail },
    { id: 4, title: 'Password', description: 'Create a secure password', icon: Lock }
  ]

  const totalSteps = steps.length

  const handlePasswordChange = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }

  const nextStep = async () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setError('')
    
    if (!validateCurrentStep()) {
      setIsAnimating(false)
      return
    }
    
    setCompletedSteps(prev => [...prev, currentStep])
    
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
      setIsAnimating(false)
    }, 300)
  }

  const prevStep = () => {
    if (isAnimating || currentStep === 1) return
    
    setIsAnimating(true)
    setError('')
    
    setCompletedSteps(prev => prev.filter(step => step !== currentStep))
    
    setTimeout(() => {
      setCurrentStep(prev => Math.max(prev - 1, 1))
      setIsAnimating(false)
    }, 300)
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError('Please enter both first and last name')
          return false
        }
        return true
      case 2:
        if (!formData.username.trim()) {
          setError('Please enter a username')
          return false
        }
        if (formData.username.length < 3 || formData.username.length > 20) {
          setError('Username must be between 3 and 20 characters')
          return false
        }
        const usernameRegex = /^[a-zA-Z0-9._]+$/
        if (!usernameRegex.test(formData.username)) {
          setError('Username can only contain letters, numbers, dots, and underscores')
          return false
        }
        return true
      case 3:
        if (!formData.email.trim()) {
          setError('Please enter your email')
          return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address')
          return false
        }
        return true
      case 4:
        if (!formData.password.trim()) {
          setError('Please enter a password')
          return false
        }
        if (passwordStrength < 2) {
          setError('Password is too weak. Please use a stronger password')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return false
        }
        return true
      default:
        return true
    }
  }

  const getStrengthLabel = () => {
    if (passwordStrength < 2) return 'Weak'
    if (passwordStrength < 4) return 'Medium'
    return 'Strong'
  }

  const getStrengthColor = () => {
    if (passwordStrength < 2) return 'bg-red-500'
    if (passwordStrength < 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep < totalSteps) {
      await nextStep()
      return
    }
    
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Check for duplicate username
      const { data: usernameExists } = await supabase
        .rpc('check_username_exists', { username_to_check: formData.username })

      if (usernameExists) {
        setError('Username already exists. Please choose a different one.')
        setIsLoading(false)
        return
      }

      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.username, 
        formData.firstName, 
        formData.lastName
      )
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    if (name === 'password') {
      handlePasswordChange(value)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setError('')

    try {
      console.log('🔄 Starting Google OAuth signup...')
      const result = await signUpWithGoogle()
      
      if (result.success) {
        console.log('✅ Google OAuth signup initiated successfully')
        // The redirect will happen automatically via Supabase
      } else {
        setError(result.error || 'Failed to sign up with Google')
      }
    } catch (error: any) {
      console.error('❌ Google OAuth signup error:', error)
      setError(error.message || 'Failed to sign up with Google')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const renderStepContent = () => {
    if (success) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Account Created</h2>
          <p className="text-lg text-gray-600 mb-8">
            Please check your email to confirm your account.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Next steps:</strong> Check your email inbox (and spam folder) for a confirmation link. 
              Click the link to activate your account and start using HeartMail.
            </p>
          </div>
          <Button 
            onClick={() => router.push('/login')}
            className="btn-heartmail"
          >
            Go to Sign In
          </Button>
        </div>
      )
    }

    const currentStepData = steps[currentStep - 1]
    const Icon = currentStepData.icon

    return (
      <div className={`transition-all duration-500 ease-in-out ${isAnimating ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'}`}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h2>
          <p className="text-gray-600">{currentStepData.description}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    className="pl-10 h-12 text-lg"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    className="pl-10 h-12 text-lg"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    className="pl-10 h-12 text-lg"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500">This will be your public display name</p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
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
                    placeholder="Enter your email address"
                    className="pl-10 h-12 text-lg"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
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
                    placeholder="Create a secure password"
                    className="pl-10 pr-10 h-12 text-lg"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordStrength > 0 && (
                  <div className="space-y-1">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">{getStrengthLabel()}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 h-12 text-lg"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0 w-full max-w-lg">
      <CardHeader className="text-center">
        <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
          <Logo size={32} className="h-8 w-8" />
          <span className="text-2xl font-bold text-heartmail-pink">HeartMail</span>
        </Link>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = currentStep === step.id
            const Icon = step.icon
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 transition-all duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          {renderStepContent()}
          
          {!success && (
            <div className="flex items-center justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || isAnimating}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            
            <Button 
              type="submit" 
              className="btn-heartmail flex items-center space-x-2" 
              disabled={isLoading || isAnimating}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : currentStep === totalSteps ? (
                <>
                  <Heart className="h-4 w-4" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          )}
        </form>

        {/* Google Sign Up - Only show on first step */}
        {currentStep === 1 && (
          <>
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors py-4 text-base font-medium mt-4"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span>{isGoogleLoading ? 'Signing up...' : 'Continue with Google'}</span>
            </Button>
          </>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-heartmail-pink hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
