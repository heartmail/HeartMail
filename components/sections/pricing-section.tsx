'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useSubscription } from '@/lib/subscription-context'

interface PricingSectionProps {
  user: any;
}

export default function PricingSection({ user }: PricingSectionProps) {
  const router = useRouter()
  // Safely get subscription context
  let subscription, isLoading, isFamily, isExtended, isFree
  try {
    const subscriptionContext = useSubscription()
    subscription = subscriptionContext.subscription
    isLoading = subscriptionContext.isLoading
    isFamily = subscriptionContext.isFamily
    isExtended = subscriptionContext.isExtended
    isFree = subscriptionContext.isFree
    
    // Debug logging
    console.log('PricingSection - User:', user?.email)
    console.log('PricingSection - Subscription:', subscription)
    console.log('PricingSection - isFamily:', isFamily, 'isExtended:', isExtended, 'isFree:', isFree)
  } catch (error) {
    // SubscriptionProvider not available, use default values
    console.log('SubscriptionProvider not available in PricingSection')
    subscription = null
    isLoading = false
    isFamily = false
    isExtended = false
    isFree = true
  }

  const handleCheckout = async (priceId: string, isUpgrade: boolean = false) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!priceId) {
      toast.error('Price ID not configured. Please contact support.')
      return
    }

    setLoadingPriceId(priceId)
    const loadingMessage = isUpgrade ? 'Processing upgrade...' : 'Redirecting to checkout...'
    toast.loading(loadingMessage, { id: 'checkout-toast' })
    
    try {
      const endpoint = isUpgrade ? '/api/stripe/upgrade' : '/api/stripe/create-checkout-session'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          priceId, 
          userId: user.id,
          customerEmail: user.email 
        }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        router.push(data.url)
      } else {
        throw new Error(data.error || 'Failed to create checkout session.')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error(`Failed to initiate checkout: ${error.message || 'Please try again.'}`, { id: 'checkout-toast' })
    } finally {
      setLoadingPriceId(null)
    }
  }

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      frequency: billingPeriod === 'yearly' ? 'per year' : 'per month',
      features: [
        'Send 5 emails/month',
        'Basic templates',
        '1 recipient',
        'Limited activity history',
      ],
      isPrimary: false,
      priceId: null,
    },
    {
      name: 'Family',
      price: billingPeriod === 'yearly' ? '$99' : '$9',
      frequency: billingPeriod === 'yearly' ? 'per year' : 'per month',
      features: [
        'Send 100 emails/month',
        'Access to all templates',
        'Unlimited recipients',
        'Full activity history',
        'Priority support',
        'Scheduled emails',
      ],
      isPrimary: true,
      priceId: billingPeriod === 'yearly' 
        ? process.env.NEXT_PUBLIC_STRIPE_FAMILY_YEARLY_PRICE_ID || 'price_1SKrdk8h6OhnnNXPSvBuaizn'
        : process.env.NEXT_PUBLIC_STRIPE_FAMILY_MONTHLY_PRICE_ID || 'price_1SJ3gL8h6OhnnNXPXyTiD9Yo',
    },
    {
      name: 'Extended',
      price: billingPeriod === 'yearly' ? '$299' : '$29',
      frequency: billingPeriod === 'yearly' ? 'per year' : 'per month',
      features: [
        'Send unlimited emails',
        'Custom templates',
        'Dedicated account manager',
        'Advanced analytics',
        'Early access to new features',
        'All Family features',
      ],
      isPrimary: false,
      priceId: billingPeriod === 'yearly' 
        ? process.env.NEXT_PUBLIC_STRIPE_EXTENDED_YEARLY_PRICE_ID || 'price_1SKreZ8h6OhnnNXPoW8jQTF3'
        : process.env.NEXT_PUBLIC_STRIPE_EXTENDED_MONTHLY_PRICE_ID || 'price_1SJ3gO8h6OhnnNXPY430Z8DW',
    },
  ]

  // Adjust button text and actions based on user and subscription status
  const getButtonProps = (planName: string, planPriceId: string | null | undefined) => {
    // No user - show "Get Started" for all plans
    if (!user) {
      return {
        text: 'Get Started',
        action: () => router.push('/login'),
        disabled: false,
        className: 'w-full py-3 text-lg font-semibold bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
      }
    }

    // User is signed in but subscription is loading
    if (isLoading) {
      return {
        text: 'Loading...',
        action: () => {},
        disabled: true,
        className: 'w-full py-3 text-lg font-semibold bg-gray-200 text-gray-800 cursor-not-allowed'
      }
    }

    // Free plan logic
    if (planName === 'Free') {
      if (isFree) {
        return { 
          text: 'Active', 
          action: () => {}, 
          disabled: true,
          className: 'w-full py-3 text-lg font-semibold bg-green-100 text-green-800 cursor-not-allowed'
        }
      } else {
        // Pro/Premium users can't downgrade to Free
        return { 
          text: 'Not Available', 
          action: () => {}, 
          disabled: true,
          className: 'w-full py-3 text-lg font-semibold bg-gray-200 text-gray-500 cursor-not-allowed'
        }
      }
    }

    // Family plan logic
    if (planName === 'Family') {
      if (isFamily) {
        return { 
          text: 'Active', 
          action: () => {}, 
          disabled: true,
          className: 'w-full py-3 text-lg font-semibold bg-green-100 text-green-800 cursor-not-allowed'
        }
      } else if (isExtended) {
        // Extended users can manage their plan
        return { 
          text: 'Manage Plan', 
          action: () => router.push('/dashboard/settings?tab=billing'), 
          disabled: false,
          className: 'w-full py-3 text-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300'
        }
      } else {
        // Free users can upgrade to Family
        const isLoading = loadingPriceId === planPriceId
        const isUpgrade = !isFree // This is an upgrade if user is not on free plan
        return { 
          text: isLoading ? 'Loading...' : 'Upgrade', 
          action: () => handleCheckout(planPriceId!, isUpgrade), 
          disabled: isLoading,
          className: isLoading 
            ? 'w-full py-3 text-lg font-semibold bg-gray-200 text-gray-800 cursor-not-allowed'
            : 'w-full py-3 text-lg font-semibold bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
        }
      }
    }

    // Extended plan logic
    if (planName === 'Extended') {
      if (isExtended) {
        return { 
          text: 'Active', 
          action: () => {}, 
          disabled: true,
          className: 'w-full py-3 text-lg font-semibold bg-green-100 text-green-800 cursor-not-allowed'
        }
      } else {
        // Free or Family users can upgrade to Extended
        const isLoading = loadingPriceId === planPriceId
        const isUpgrade = !isFree // This is an upgrade if user is not on free plan
        return { 
          text: isLoading ? 'Loading...' : 'Upgrade', 
          action: () => handleCheckout(planPriceId!, isUpgrade), 
          disabled: isLoading,
          className: isLoading 
            ? 'w-full py-3 text-lg font-semibold bg-gray-200 text-gray-800 cursor-not-allowed'
            : 'w-full py-3 text-lg font-semibold bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
        }
      }
    }

    // Default fallback
    return { 
      text: 'Get Started', 
      action: () => router.push('/login'), 
      disabled: false,
      className: 'w-full py-3 text-lg font-semibold bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
    }
  }

  return (
    <section id="pricing" className="py-20 bg-gray-800 scroll-mt-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple & Transparent Pricing</h2>
        <p className="text-xl text-gray-300 mb-10">
          Choose the plan that's right for you and start sending heartfelt messages.
        </p>
        
        {/* Billing Period Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-gray-700 rounded-lg p-1 flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-2 bg-heartmail-pink text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const { text, action, disabled, className } = getButtonProps(plan.name, plan.priceId)
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-xl p-8 flex flex-col transition-all duration-300 ${
                  plan.isPrimary ? 'border-4 border-pink-500 transform scale-105 relative' : 'border border-gray-200'
                }`}
              >
                {plan.isPrimary && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-pink-500">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">{plan.frequency}</span>
                </div>
                <ul className="text-gray-600 text-left space-y-4 flex-grow mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={className}
                  onClick={action}
                  disabled={disabled}
                >
                  {text}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}