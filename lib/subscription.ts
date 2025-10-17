import { supabase } from './supabase'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | 'free'
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionUsage {
  id: string
  user_id: string
  subscription_id: string | null
  recipients_count: number
  templates_used: number
  emails_sent_this_month: number
  last_reset_date: string
  created_at: string
  updated_at: string
}

export interface BillingHistory {
  id: string
  user_id: string
  subscription_id: string | null
  stripe_invoice_id: string | null
  amount_paid: number | null
  currency: string
  status: 'paid' | 'open' | 'void' | 'uncollectible'
  invoice_url: string | null
  hosted_invoice_url: string | null
  created_at: string
}

export interface PlanLimits {
  plan_name: string
  recipients_limit: number
  templates_limit: number
  emails_per_month: number
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user subscription:', error)
    throw error
  }

  return data as Subscription | null
}

/**
 * Get user's subscription usage
 */
export async function getUserUsage(userId: string): Promise<SubscriptionUsage | null> {
  const { data, error } = await supabase
    .from('subscription_usage')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user usage:', error)
    throw error
  }

  return data as SubscriptionUsage | null
}

/**
 * Get user's plan limits based on their subscription
 */
export async function getUserLimits(userId: string): Promise<PlanLimits> {
  const { data, error } = await supabase
    .rpc('get_user_limits', { user_uuid: userId })

  if (error) {
    console.error('Error fetching user limits:', error)
    // Return free plan limits as fallback
    return {
      plan_name: 'Free',
      recipients_limit: 1,
      templates_limit: 3,
      emails_per_month: 10
    }
  }

  return data?.[0] || {
    plan_name: 'Free',
    recipients_limit: 1,
    templates_limit: 3,
    emails_per_month: 10
  }
}

/**
 * Get user's billing history
 */
export async function getUserBillingHistory(userId: string): Promise<BillingHistory[]> {
  const { data, error } = await supabase
    .from('billing_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching billing history:', error)
    throw error
  }

  return data as BillingHistory[]
}

/**
 * Update subscription usage
 */
export async function updateUserUsage(
  userId: string, 
  updates: Partial<Pick<SubscriptionUsage, 'recipients_count' | 'templates_used' | 'emails_sent_this_month'>>
): Promise<SubscriptionUsage> {
  const { data, error } = await supabase
    .from('subscription_usage')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error updating user usage:', error)
    throw error
  }

  return data as SubscriptionUsage
}

/**
 * Check if user can add more recipients
 */
export async function canAddRecipient(userId: string): Promise<boolean> {
  const [subscription, usage, limits] = await Promise.all([
    getUserSubscription(userId),
    getUserUsage(userId),
    getUserLimits(userId)
  ])

  // If no subscription, check free plan limits
  if (!subscription || subscription.status === 'free') {
    return (usage?.recipients_count || 0) < limits.recipients_limit
  }

  // For paid plans, check if they're active
  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return false
  }

  // Check usage limits
  if (limits.recipients_limit === -1) {
    return true // Unlimited
  }

  return (usage?.recipients_count || 0) < limits.recipients_limit
}

/**
 * Check if user can send more emails this month
 */
export async function canSendEmail(userId: string): Promise<boolean> {
  const [subscription, usage, limits] = await Promise.all([
    getUserSubscription(userId),
    getUserUsage(userId),
    getUserLimits(userId)
  ])

  // If no subscription, check free plan limits
  if (!subscription || subscription.status === 'free') {
    return (usage?.emails_sent_this_month || 0) < limits.emails_per_month
  }

  // For paid plans, check if they're active
  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return false
  }

  // Check usage limits
  if (limits.emails_per_month === -1) {
    return true // Unlimited
  }

  return (usage?.emails_sent_this_month || 0) < limits.emails_per_month
}

/**
 * Increment email count for user
 */
export async function incrementEmailCount(userId: string): Promise<void> {
  const { error } = await supabase
    .from('subscription_usage')
    .update({
      emails_sent_this_month: (supabase as any).raw('emails_sent_this_month + 1'),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error incrementing email count:', error)
    throw error
  }
}

/**
 * Get subscription status for display
 */
export function getSubscriptionStatus(subscription: Subscription | null): {
  status: string
  plan: string
  isActive: boolean
  canUpgrade: boolean
} {
  if (!subscription) {
    return {
      status: 'Free Plan',
      plan: 'Free',
      isActive: true,
      canUpgrade: true
    }
  }

  const planNames: Record<string, string> = {
    'price_1SJ3gL8h6OhnnNXPXyTiD9Yo': 'Family',
    'price_1SJ3gO8h6OhnnNXPY430Z8DW': 'Extended Family'
  }

  const plan = planNames[subscription.stripe_price_id || ''] || 'Free'
  const isActive = subscription.status === 'active' || subscription.status === 'trialing'
  const canUpgrade = subscription.status === 'active' && plan !== 'Extended Family'

  return {
    status: subscription.status === 'active' ? 'Active' : 
            subscription.status === 'trialing' ? 'Trial' :
            subscription.status === 'canceled' ? 'Canceled' : 'Inactive',
    plan,
    isActive,
    canUpgrade
  }
}
