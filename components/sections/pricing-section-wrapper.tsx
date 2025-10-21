'use client'

import { useAuthState } from '@/lib/use-auth-state'
import PricingSection from './pricing-section'

export default function PricingSectionWrapper() {
  const { user, isAuthenticated, loading } = useAuthState()
  
  return <PricingSection user={user} />
}
