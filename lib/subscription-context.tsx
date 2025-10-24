'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
// Removed useAuth import to prevent context errors

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused' | null;

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  plan: string; // Plan name: 'free', 'pro', 'premium'
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
  isFamily: boolean;
  isExtended: boolean;
  isFree: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  
  // Get user from Supabase session instead of context
  const [user, setUser] = useState<any>(null)
  
  useEffect(() => {
    setMounted(true)
    const getUser = async () => {
      try {
        // Only run on client side
        if (typeof window === 'undefined') return
        
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error getting user session:', error)
        setUser(null)
      }
    }
    getUser()
  }, [])

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      console.log('SubscriptionContext - No user, setting subscription to null')
      setSubscription(null)
      setIsLoading(false)
      return
    }

    console.log('SubscriptionContext - Fetching subscription for user:', user.email)
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.log('SubscriptionContext - No subscription found, using free plan')
        // Use free plan without creating database record
        setSubscription({
          id: 'free-plan',
          user_id: user.id,
          stripe_customer_id: '',
          stripe_subscription_id: '',
          status: 'active',
          plan: 'free',
          plan_id: '',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date().toISOString(),
          cancel_at_period_end: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } else if (data) {
        console.log('SubscriptionContext - Found subscription:', data)
        setSubscription(data)
      } else {
        // No subscription found, use free plan
        setSubscription({
          id: 'free-plan',
          user_id: user.id,
          stripe_customer_id: '',
          stripe_subscription_id: '',
          status: 'active',
          plan: 'free',
          plan_id: '',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date().toISOString(),
          cancel_at_period_end: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.log('SubscriptionContext - Error fetching subscription, using free plan:', error)
      // Use free plan on error instead of null
      setSubscription({
        id: 'free-plan',
        user_id: user.id,
        stripe_customer_id: '',
        stripe_subscription_id: '',
        status: 'active',
        plan: 'free',
        plan_id: '',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date().toISOString(),
        cancel_at_period_end: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (mounted) {
      fetchSubscription()
    }
  }, [user, fetchSubscription, mounted])

  const isFamily = subscription?.plan === 'family' && subscription?.status === 'active'
  const isExtended = subscription?.plan === 'extended' && subscription?.status === 'active'
  const isFree = !subscription || subscription?.plan === 'free' || subscription?.status === 'canceled' || subscription?.status === 'unpaid' || subscription?.status === 'incomplete' || subscription?.status === 'incomplete_expired' || subscription?.status === 'paused'

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <SubscriptionContext.Provider value={{ subscription, isLoading, fetchSubscription, isFamily, isExtended, isFree }}>
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
