'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, Check, Heart } from 'lucide-react'
import Logo from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
// Google OAuth temporarily removed
import { supabase } from '@/lib/supabase'

export default function SignupForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  // Google OAuth state removed
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

  const { signUp } = useAuth()
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
    
    // Validate current step
    if (!validateCurrentStep()) {
      setIsAnimating(false)
      return
    }
    
    // Mark current step as completed
    setCompletedSteps(prev => [...prev, currentStep])
    
    // Animate to next step
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
      setIsAnimating(false)
    }, 300)
  }

  const prevStep = () => {
    if (isAnimating || currentStep === 1) return
    
    setIsAnimating(true)
    setError('')
    
    // Remove the current step from completed steps when going back
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
    
    // Final submission
    setIsLoading(true)
    setError('')
    setSuccess(false)

    // Check for duplicate username using the dedicated usernames table
    try {
      const { data: usernameExists } = await supabase
        .rpc('check_username_exists', { username_to_check: formData.username })

      if (usernameExists) {
        setError('Username already exists. Please choose a different one.')
        setIsLoading(false)
        return
      }
    } catch (error) {
      console.error('Error checking username:', error)
      setError('Error checking username availability. Please try again.')
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
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
      // Don't redirect immediately - user needs to confirm email
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

  // Google OAuth handler removed

  const renderStepContent = () => {
    // Show dedicated success screen when account is created
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
