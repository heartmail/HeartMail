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
  let subscription, isLoading, isPro, isPremium, isFree
  try {
    const subscriptionContext = useSubscription()
    subscription = subscriptionContext.subscription
    isLoading = subscriptionContext.isLoading
    isPro = subscriptionContext.isPro
    isPremium = subscriptionContext.isPremium
    isFree = subscriptionContext.isFree
    
    // Debug logging
    console.log('PricingSection - User:', user?.email)
    console.log('PricingSection - Subscription:', subscription)
    console.log('PricingSection - isPro:', isPro, 'isPremium:', isPremium, 'isFree:', isFree)
  } catch (error) {
    // SubscriptionProvider not available, use default values
    console.log('SubscriptionProvider not available in PricingSection')
    subscription = null
    isLoading = false
    isPro = false
    isPremium = false
    isFree = true
  }

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    toast.loading('Redirecting to checkout...', { id: 'checkout-toast' })
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, userId: user.id }),
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
    }
  }

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

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
        ? process.env.NEXT_PUBLIC_STRIPE_FAMILY_YEARLY_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_FAMILY_MONTHLY_PRICE_ID,
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
        ? process.env.NEXT_PUBLIC_STRIPE_EXTENDED_YEARLY_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_EXTENDED_MONTHLY_PRICE_ID,
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
      if (isPro) {
        return { 
          text: 'Active', 
          action: () => {}, 
          disabled: true,
          className: 'w-full py-3 text-lg font-semibold bg-green-100 text-green-800 cursor-not-allowed'
        }
      } else if (isPremium) {
        // Extended users can manage their plan
        return { 
          text: 'Manage Plan', 
          action: () => router.push('/dashboard/settings?tab=billing'), 
          disabled: false,
          className: 'w-full py-3 text-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300'
        }
      } else {
        // Free users can upgrade to Family
        return { 
          text: 'Upgrade', 
          action: () => handleCheckout(planPriceId!), 
          disabled: false,
          className: 'w-full py-3 text-lg font-semibold bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
        }
      }
    }

    // Extended plan logic
    if (planName === 'Extended') {
      if (isPremium) {
        return { 
          text: 'Active', 
          action: () => {}, 
          disabled: true,
          className: 'w-full py-3 text-lg font-semibold bg-green-100 text-green-800 cursor-not-allowed'
        }
      } else {
        // Free or Family users can upgrade to Extended
        return { 
          text: 'Upgrade', 
          action: () => handleCheckout(planPriceId!), 
          disabled: false,
          className: 'w-full py-3 text-lg font-semibold bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
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
    <section id="pricing" className="py-20" style={{ backgroundColor: '#363636' }}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Simple & Transparent Pricing</h2>
        <p className="text-xl text-gray-300 mb-8">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const { text, action, disabled, className } = getButtonProps(plan.name, plan.priceId)
            return (
              <div
                key={index}
                className={`bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col ${
                  plan.isPrimary ? 'border-4 border-heartmail-pink transform scale-105' : 'border border-gray-200 dark:border-gray-700'
                }`}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-5xl font-extrabold text-heartmail-pink mb-4">
                  {plan.price}
                  <span className="text-lg font-medium text-gray-600 dark:text-gray-300"> {plan.frequency}</span>
                </p>
                <ul className="text-gray-700 dark:text-gray-300 text-left space-y-3 flex-grow mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      {feature}
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