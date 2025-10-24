'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditCard, Mail, Users, Calendar, Star } from 'lucide-react'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  limitType: 'emails' | 'recipients' | 'templates' | 'scheduling'
  currentUsage: number
  currentLimit: number
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  limitType, 
  currentUsage, 
  currentLimit 
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getLimitMessage = () => {
    switch (limitType) {
      case 'emails':
        return `You've reached your limit of ${currentLimit} emails per month. Upgrade to send more emails!`
      case 'recipients':
        return `You've reached your limit of ${currentLimit} recipients. Upgrade to add more recipients!`
      case 'templates':
        return 'Premium templates are available with Family and Extended plans!'
      case 'scheduling':
        return 'Email scheduling is available with Family and Extended plans!'
      default:
        return 'Upgrade to unlock more features!'
    }
  }

  const handleUpgrade = async (plan: 'family' | 'extended') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan === 'family' 
            ? process.env.NEXT_PUBLIC_STRIPE_FAMILY_PRICE_ID 
            : process.env.NEXT_PUBLIC_STRIPE_EXTENDED_PRICE_ID,
          mode: 'subscription'
        })
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start upgrade process. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Upgrade Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {getLimitMessage()}
          </p>
          
          {limitType === 'emails' && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Current Usage:</span>
                <span>{currentUsage} / {currentLimit} emails</span>
              </div>
            </div>
          )}
          
          {limitType === 'recipients' && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Current Usage:</span>
                <span>{currentUsage} / {currentLimit} recipients</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Choose your plan:</h4>
            
            {/* Family Plan */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Family Plan</h5>
                  <p className="text-sm text-gray-600">$9/month</p>
                </div>
                <Button 
                  onClick={() => handleUpgrade('family')}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 300 emails per month</li>
                <li>• Unlimited recipients</li>
                <li>• Access to all templates</li>
                <li>• Full activity history</li>
                <li>• Priority support</li>
                <li>• Scheduled emails</li>
              </ul>
            </div>

            {/* Extended Plan */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Extended Plan</h5>
                  <p className="text-sm text-gray-600">$29/month</p>
                </div>
                <Button 
                  onClick={() => handleUpgrade('extended')}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Unlimited emails</li>
                <li>• All Family features</li>
                <li>• Maximum flexibility</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={() => window.location.href = '/pricing'}
              className="flex-1 bg-gray-900 hover:bg-gray-800"
            >
              View All Plans
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
