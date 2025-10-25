'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, ExternalLink, Loader2, Calendar, Users, Mail, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Subscription, SubscriptionUsage, PlanLimits } from '@/lib/subscription'

interface SubscriptionData {
  id: string
  status: string
  plan: string
  price_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  usage: {
    recipients_created: number
    emails_sent_this_month: number
  }
}

export default function BillingSettings() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const { user } = useAuth()

  // Listen for email sent events to refresh billing data
  useEffect(() => {
    const handleEmailSent = () => {
      if (user) {
        fetchSubscription()
      }
    }

    window.addEventListener('emailSent', handleEmailSent)
    return () => window.removeEventListener('emailSent', handleEmailSent)
  }, [user])

  // Periodic refresh to catch scheduled emails
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchSubscription()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  // Refresh data when page becomes visible (e.g., returning from Stripe portal)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchSubscription()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/stripe/subscription?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
        setLimits(data.limits)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCustomerPortal = async () => {
    if (!user) return

    setPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.url) {
        // Check if we can embed Stripe portal in iframe
        // Stripe portal has CSP that blocks iframe embedding
        // So we'll open in new window directly
        window.open(data.url, '_blank', 'noopener,noreferrer')
      } else {
        throw new Error('No portal URL received')
      }
    } catch (error) {
      console.error('Error opening portal:', error)
      alert('Unable to open billing portal. Please try again or contact support.')
    } finally {
      setPortalLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'canceled':
        return 'text-red-600 bg-red-100'
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100'
      case 'trialing':
        return 'text-blue-600 bg-blue-100'
      case 'free':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'Family':
        return '$9'
      case 'Extended':
        return '$29'
      case 'Free':
        return '$0'
      default:
        return '$0'
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-heartmail-pink" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Subscription & Billing</span>
              </CardTitle>
              <CardDescription>
                Manage your subscription, payment methods, and billing information.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">{subscription.plan}</h3>
                  <p className="text-sm text-gray-600">
                    {getPlanPrice(subscription.plan)}/month
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>

              {subscription.current_period_end && (
                <div className="text-sm text-gray-600">
                  <p>
                    {subscription.status === 'active' 
                      ? `Next billing date: ${new Date(subscription.current_period_end).toLocaleDateString()}`
                      : subscription.status === 'trialing'
                      ? `Trial ends: ${new Date(subscription.current_period_end).toLocaleDateString()}`
                      : 'Subscription is not active'
                    }
                  </p>
                </div>
              )}

              {/* Usage Statistics */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Usage This Month</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Recipients</span>
                    </div>
                    <span className="text-sm font-medium">
                      {subscription.usage.recipients_created} / {limits?.recipients_limit === null ? '∞' : (limits?.recipients_limit ?? 2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Emails Sent</span>
                    </div>
                    <span className="text-sm font-medium">
                      {subscription.usage.emails_sent_this_month} / {limits?.emails_per_month === null ? '∞' : (limits?.emails_per_month ?? 3)}
                    </span>
                  </div>
                </div>
              </div>

              {subscription?.plan === 'Free' || !subscription ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Upgrade to unlock more features</p>
                  <Button 
                    onClick={() => window.location.href = '/pricing'}
                    className="btn-heartmail"
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    View Pricing Plans
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                  className="w-full bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Opening Portal...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Manage Billing
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Upgrade to unlock more features</p>
              <Button 
                onClick={() => window.location.href = '/pricing'}
                className="btn-heartmail"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                View Pricing Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  )
}
