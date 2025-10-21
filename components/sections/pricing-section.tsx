'use client'

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

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      frequency: 'per month',
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
      name: 'Pro',
      price: '$9',
      frequency: 'per month',
      features: [
        'Send 100 emails/month',
        'Access to all templates',
        'Unlimited recipients',
        'Full activity history',
        'Priority support',
        'Scheduled emails',
      ],
      isPrimary: true,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    },
    {
      name: 'Premium',
      price: '$29',
      frequency: 'per month',
      features: [
        'Send unlimited emails',
        'Custom templates',
        'Dedicated account manager',
        'Advanced analytics',
        'Early access to new features',
        'All Pro features',
      ],
      isPrimary: false,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    },
  ]

  // Adjust button text and actions based on user and subscription status
  const getButtonProps = (planName: string, planPriceId: string | null | undefined) => {
    if (!user) {
      return {
        text: 'Get Started',
        action: () => router.push('/login'),
        disabled: false,
      }
    }

    // User is signed in
    if (isLoading) {
      return {
        text: 'Loading...',
        action: () => {},
        disabled: true,
      }
    }

    if (planName === 'Free') {
      if (isFree) {
        return { text: 'Current Plan', action: () => {}, disabled: true }
      } else {
        // If user is Pro/Premium, they can't downgrade to Free via this button
        return { text: 'Not Applicable', action: () => {}, disabled: true }
      }
    }

    // For Pro/Premium plans
    if (isPro && planName === 'Pro') {
      return { text: 'Current Plan', action: () => {}, disabled: true }
    }
    if (isPremium && planName === 'Premium') {
      return { text: 'Current Plan', action: () => {}, disabled: true }
    }

    // If user is Free and wants to upgrade
    if (isFree) {
      return { text: 'Upgrade', action: () => handleCheckout(planPriceId!), disabled: false }
    }

    // If user is Pro and wants to upgrade to Premium
    if (isPro && planName === 'Premium') {
      return { text: 'Upgrade', action: () => handleCheckout(planPriceId!), disabled: false }
    }

    // Default for other cases (e.g., Pro user viewing Pro plan, Premium user viewing Pro plan)
    return { text: 'Manage Plan', action: () => router.push('/dashboard/settings?tab=billing'), disabled: false }
  }

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple & Transparent Pricing</h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          Choose the plan that's right for you and start sending heartfelt messages.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const { text, action, disabled } = getButtonProps(plan.name, plan.priceId)
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
                  className={`w-full py-3 text-lg font-semibold ${
                    plan.isPrimary
                      ? 'bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                  }`}
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