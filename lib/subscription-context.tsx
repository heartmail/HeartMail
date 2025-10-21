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
        .in('status', ['trialing', 'active', 'past_due']) // Consider these as active for feature access
        .order('current_period_end', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error
      }

      if (!data) {
        // No subscription found, create a default free subscription
        console.log('SubscriptionContext - No subscription found, creating default free subscription')
        const { data: newSubscription, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan: 'free',
            status: 'active'
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating default subscription:', createError)
          setSubscription(null)
        } else {
          console.log('SubscriptionContext - Created default subscription:', newSubscription)
          setSubscription(newSubscription)
        }
      } else {
        console.log('SubscriptionContext - Found subscription:', data)
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (mounted) {
      fetchSubscription()
    }
  }, [user, fetchSubscription, mounted])

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'
  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active'
  const isFree = !subscription || subscription?.plan === 'free' || subscription?.status === 'canceled' || subscription?.status === 'unpaid' || subscription?.status === 'incomplete' || subscription?.status === 'incomplete_expired' || subscription?.status === 'paused'

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

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
