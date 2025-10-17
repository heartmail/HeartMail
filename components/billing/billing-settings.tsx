'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, ExternalLink, Loader2, Calendar, Users, Mail } from 'lucide-react'
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
    recipients_count: number
    templates_used: number
    emails_sent_this_month: number
  }
}

export default function BillingSettings() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
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
        window.open(data.url, '_blank')
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
        return '$9.99'
      case 'Extended Family':
        return '$19.99'
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
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Subscription & Billing</span>
          </CardTitle>
          <CardDescription>
            Manage your subscription, payment methods, and billing information.
          </CardDescription>
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
                      {subscription.usage.recipients_count} / {limits?.recipients_limit === -1 ? '∞' : limits?.recipients_limit || 1}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Emails Sent</span>
                    </div>
                    <span className="text-sm font-medium">
                      {subscription.usage.emails_sent_this_month} / {limits?.emails_per_month === -1 ? '∞' : limits?.emails_per_month || 10}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={openCustomerPortal}
                disabled={portalLoading || subscription.status === 'free'}
                className="w-full"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening Portal...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Manage Billing
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No active subscription</p>
              <Button 
                onClick={() => window.location.href = '/pricing'}
                className="btn-heartmail"
              >
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods and billing information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Payment methods are managed through the Stripe Customer Portal.
          </p>
          {subscription && subscription.status === 'free' ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-4">
                Upgrade to a paid plan to manage payment methods.
              </p>
              <Button 
                onClick={() => window.location.href = '/pricing'}
                className="btn-heartmail"
              >
                View Plans
              </Button>
            </div>
          ) : (
            <Button
              onClick={openCustomerPortal}
              disabled={portalLoading || !subscription}
              variant="outline"
              className="w-full"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening Portal...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage Payment Methods
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
