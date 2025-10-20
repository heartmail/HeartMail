'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused' | null;

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  plan_id: string; // Stripe Price ID
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  fetchSubscription: () => Promise<void>;
  isPro: boolean;
  isPremium: boolean;
  isFree: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Safely get user from auth context
  let user = null
  try {
    const authContext = useAuth()
    user = authContext?.user
  } catch (error) {
    console.log('AuthProvider not available in SubscriptionProvider')
  }

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['trialing', 'active', 'past_due']) // Consider these as active for feature access
        .order('current_period_end', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error
      }

      setSubscription(data || null)
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSubscription()
  }, [user, fetchSubscription])

  const isPro = subscription?.plan_id === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID && subscription?.status === 'active'
  const isPremium = subscription?.plan_id === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID && subscription?.status === 'active'
  const isFree = !subscription || subscription?.status === 'canceled' || subscription?.status === 'unpaid' || subscription?.status === 'incomplete' || subscription?.status === 'incomplete_expired' || subscription?.status === 'paused'

  return (
    <SubscriptionContext.Provider value={{ subscription, isLoading, fetchSubscription, isPro, isPremium, isFree }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
