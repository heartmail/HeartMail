'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'
import { redirectToCheckout } from '@/lib/stripe-client'
import { useAuth } from '@/lib/auth-context'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '1 recipient',
      '3 basic templates',
      'Daily/Weekly/Monthly scheduling',
      'Basic customization'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline' as const,
    popular: false,
    priceId: null
  },
  {
    name: 'Family',
    price: '$9.99',
    period: '/month',
    description: 'Most popular for families',
    features: [
      'Up to 5 recipients',
      'All template categories',
      'Photo attachments',
      'Advanced scheduling',
      'Basic analytics'
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'default' as const,
    popular: true,
    priceId: 'price_1SJ3gL8h6OhnnNXPXyTiD9Yo'
  },
  {
    name: 'Extended Family',
    price: '$19.99',
    period: '/month',
    description: 'For larger families',
    features: [
      'Unlimited recipients',
      'Premium templates',
      'AI personalization',
      'Priority support',
      'Advanced analytics'
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'outline' as const,
    popular: false,
    priceId: 'price_1SJ3gO8h6OhnnNXPY430Z8DW'
  }
]

export default function StripePricing() {
  const [loading, setLoading] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [showCoupon, setShowCoupon] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const { user } = useAuth()

  // Fetch user's subscription status
  useEffect(() => {
    if (user) {
      fetch(`/api/stripe/subscription?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.subscription) {
            setSubscription(data.subscription)
          }
        })
        .catch(err => console.error('Error fetching subscription:', err))
    }
  }, [user])

  // Get button text and state based on user and subscription
  const getButtonState = (plan: typeof plans[0]) => {
    if (!user) {
      return {
        text: 'Get Started',
        disabled: false,
        variant: plan.popular ? 'default' : 'outline'
      }
    }

    // User is signed in
    if (plan.name === 'Free') {
      // Free plan is always available to signed-in users
      return {
        text: 'Active',
        disabled: true,
        variant: 'outline'
      }
    }

    if (subscription && subscription.status === 'active') {
      const currentPlan = subscription.price_id
      if (currentPlan === plan.priceId) {
        return {
          text: 'Current Plan',
          disabled: true,
          variant: 'outline'
        }
      } else {
        return {
          text: plan.name === 'Family' ? 'Upgrade' : 'Extend Family',
          disabled: false,
          variant: plan.popular ? 'default' : 'outline'
        }
      }
    }

    // No active subscription - user is signed in but on free plan
    return {
      text: 'Upgrade',
      disabled: false,
      variant: plan.popular ? 'default' : 'outline'
    }
  }

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!plan.priceId) {
      // Free plan - redirect to signup
      window.location.href = '/signup'
      return
    }

    if (!user) {
      // Redirect to login first
      window.location.href = '/login'
      return
    }

    setLoading(plan.name)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          customerEmail: user.email,
          userId: user.id,
          couponCode: couponCode || undefined
        }),
      })

      const { sessionId } = await response.json()

      if (sessionId) {
        await redirectToCheckout(sessionId)
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan, index) => (
        <Card 
          key={index} 
          className={`relative h-full min-h-[400px] ${plan.popular ? 'border-heartmail-pink shadow-2xl scale-105' : ''}`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-heartmail-pink text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
          )}
          <CardHeader className="text-center py-4">
            <CardTitle className="text-2xl font-bold mb-4">{plan.name}</CardTitle>
            <div className="mt-4 mb-4">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-lg text-gray-500 ml-2">{plan.period}</span>
            </div>
            <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-full px-6 pb-6">
            <ul className="space-y-3 mb-4 flex-grow">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            
            {/* Coupon Code Input */}
            {plan.priceId && (
              <div className="mb-3">
                {!showCoupon ? (
                  <button
                    onClick={() => setShowCoupon(true)}
                    className="text-sm text-heartmail-pink hover:underline"
                  >
                    Have a coupon code?
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="text-sm"
                    />
                    <button
                      onClick={() => setShowCoupon(false)}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {(() => {
              const buttonState = getButtonState(plan)
              return (
                <Button 
                  className={`w-full py-3 text-sm font-semibold ${
                    buttonState.disabled 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                      : buttonState.variant === 'default' 
                        ? 'btn-heartmail' 
                        : 'btn-heartmail-outline'
                  }`}
                  variant={buttonState.variant as "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"}
                  onClick={() => !buttonState.disabled && handleSubscribe(plan)}
                  disabled={loading === plan.name || buttonState.disabled}
                >
                  {loading === plan.name ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    buttonState.text
                  )}
                </Button>
              )
            })()}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
