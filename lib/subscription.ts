import { supabase } from './supabase'
import { createAdminClient } from './supabase'

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
  recipients_limit: number | null
  templates_limit: number | null
  emails_per_month: number | null
}

export interface Plan {
  id: string
  name: string
  display_name: string
  price_monthly: number
  price_yearly?: number
  email_limit: number | null
  recipients_limit: number | null
  templates_limit: number | null
  stripe_price_id?: string
  stripe_product_id?: string
  features: {
    scheduling: boolean
    premiumTemplates: boolean
    prioritySupport: boolean
    customBranding: boolean
  }
  is_active: boolean
  sort_order: number
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
  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
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
 * Get all available plans from database
 */
export async function getAllPlans(): Promise<Plan[]> {
  try {
    const adminSupabase = createAdminClient()
    
    const { data: plans, error } = await adminSupabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching plans:', error)
      return getDefaultPlans()
    }

    return plans || getDefaultPlans()
  } catch (error) {
    console.error('Error in getAllPlans:', error)
    return getDefaultPlans()
  }
}

/**
 * Get default plans (fallback when database is not available)
 */
function getDefaultPlans(): Plan[] {
  return [
    {
      id: 'free',
      name: 'free',
      display_name: 'Free',
      price_monthly: 0,
      email_limit: 3,
      recipients_limit: 2,
      templates_limit: 3,
      features: {
        scheduling: false,
        premiumTemplates: false,
        prioritySupport: false,
        customBranding: false
      },
      is_active: true,
      sort_order: 1
    },
    {
      id: 'family',
      name: 'family',
      display_name: 'Family',
      price_monthly: 9,
      email_limit: 300,
      recipients_limit: null,
      templates_limit: null,
      features: {
        scheduling: true,
        premiumTemplates: true,
        prioritySupport: true,
        customBranding: false
      },
      is_active: true,
      sort_order: 2
    },
    {
      id: 'extended',
      name: 'extended',
      display_name: 'Extended',
      price_monthly: 29,
      email_limit: null,
      recipients_limit: null,
      templates_limit: null,
      features: {
        scheduling: true,
        premiumTemplates: true,
        prioritySupport: true,
        customBranding: true
      },
      is_active: true,
      sort_order: 3
    }
  ]
}

/**
 * Get user's plan limits based on their subscription
 */
export async function getUserLimits(userId: string): Promise<PlanLimits> {
  try {
    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()
    
    // Get user's subscription
    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError)
    }

    const planName = subscription?.plan || 'free'
    const status = subscription?.status || 'active'

    // Try to get plan from database first
    try {
      const { data: plan, error: planError } = await adminSupabase
        .from('plans')
        .select('*')
        .eq('name', planName)
        .eq('is_active', true)
        .single()

      if (!planError && plan) {
        return {
          plan_name: plan.display_name,
          recipients_limit: plan.recipients_limit,
          templates_limit: plan.templates_limit,
          emails_per_month: plan.email_limit
        }
      }
    } catch (dbError) {
      console.log('Database plans table not available, using fallback')
    }

    // Fallback to hardcoded limits
    switch (planName) {
      case 'family':
        return {
          plan_name: 'Family',
          recipients_limit: null, // Unlimited
          templates_limit: null, // Unlimited
          emails_per_month: 300
        }
      case 'extended':
        return {
          plan_name: 'Extended',
          recipients_limit: null, // Unlimited
          templates_limit: null, // Unlimited
          emails_per_month: null // Unlimited
        }
      default: // free
        return {
          plan_name: 'Free',
          recipients_limit: 2,
          templates_limit: 3,
          emails_per_month: 3
        }
    }
  } catch (error) {
    console.error('Error in getUserLimits:', error)
    // Return free plan limits as fallback
    return {
      plan_name: 'Free',
      recipients_limit: 2,
      templates_limit: 3,
      emails_per_month: 3
    }
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
  try {
    const [usage, limits] = await Promise.all([
      getUserUsage(userId),
      getUserLimits(userId)
    ])

    // Check if user has unlimited recipients
    if (limits.recipients_limit === null) {
      return true // Unlimited
    }

    // Check current usage against limit
    return (usage?.recipients_count || 0) < limits.recipients_limit
  } catch (error) {
    console.error('Error in canAddRecipient:', error)
    return false
  }
}

/**
 * Check if user can send more emails this month
 */
export async function canSendEmail(userId: string): Promise<boolean> {
  try {
    const [usage, limits] = await Promise.all([
      getUserUsage(userId),
      getUserLimits(userId)
    ])

    // Check if user has unlimited emails
    if (limits.emails_per_month === null) {
      return true // Unlimited
    }

    // Check current usage against limit
    return (usage?.emails_sent_this_month || 0) < limits.emails_per_month
  } catch (error) {
    console.error('Error in canSendEmail:', error)
    return false
  }
}

/**
 * Increment email count for user
 */
export async function incrementEmailCount(userId: string): Promise<void> {
  try {
    const adminSupabase = createAdminClient()
    
    // Use UTC date to avoid system clock issues
    const now = new Date()
    const utcYear = now.getUTCFullYear()
    const utcMonth = now.getUTCMonth() + 1
    const currentMonth = `${utcYear}-${String(utcMonth).padStart(2, '0')}`
    
    console.log('incrementEmailCount - Current month (UTC):', currentMonth)
    
    // First, get the current usage record
    const { data: currentUsage, error: fetchError } = await adminSupabase
      .from('subscription_usage')
      .select('emails_sent_this_month, recipients_created')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching current usage:', fetchError)
      throw fetchError
    }

    const currentEmailCount = currentUsage?.emails_sent_this_month || 0
    const currentRecipientCount = currentUsage?.recipients_created || 0

    // Update or insert the usage record
    const { error: upsertError } = await adminSupabase
      .from('subscription_usage')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        emails_sent_this_month: currentEmailCount + 1,
        recipients_created: currentRecipientCount, // Keep existing recipient count
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      console.error('Error incrementing email count:', upsertError)
      throw upsertError
    }

    console.log('✅ Email count incremented successfully for user:', userId)
  } catch (error) {
    console.error('Error in incrementEmailCount:', error)
    throw error
  }
}

/**
 * Increment recipient count for user
 */
export async function incrementRecipientCount(userId: string): Promise<void> {
  try {
    const adminSupabase = createAdminClient()
    
    // Use UTC date to avoid system clock issues
    const now = new Date()
    const utcYear = now.getUTCFullYear()
    const utcMonth = now.getUTCMonth() + 1
    const currentMonth = `${utcYear}-${String(utcMonth).padStart(2, '0')}`
    
    console.log('incrementRecipientCount - Current month (UTC):', currentMonth)
    
    // First, get the current usage record
    const { data: currentUsage, error: fetchError } = await adminSupabase
      .from('subscription_usage')
      .select('emails_sent_this_month, recipients_created')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching current usage:', fetchError)
      throw fetchError
    }

    const currentEmailCount = currentUsage?.emails_sent_this_month || 0
    const currentRecipientCount = currentUsage?.recipients_created || 0

    // Update or insert the usage record
    const { error: upsertError } = await adminSupabase
      .from('subscription_usage')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        emails_sent_this_month: currentEmailCount, // Keep existing email count
        recipients_created: currentRecipientCount + 1,
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      console.error('Error incrementing recipient count:', upsertError)
      throw upsertError
    }

    console.log('✅ Recipient count incremented successfully for user:', userId)
  } catch (error) {
    console.error('Error in incrementRecipientCount:', error)
    throw error
  }
}

/**
 * Decrement recipient count for user
 */
export async function decrementRecipientCount(userId: string): Promise<void> {
  try {
    const adminSupabase = createAdminClient()
    
    // Use UTC date to avoid system clock issues
    const now = new Date()
    const utcYear = now.getUTCFullYear()
    const utcMonth = now.getUTCMonth() + 1
    const currentMonth = `${utcYear}-${String(utcMonth).padStart(2, '0')}`
    
    console.log('decrementRecipientCount - Current month (UTC):', currentMonth)
    
    // First, get the current usage record
    const { data: currentUsage, error: fetchError } = await adminSupabase
      .from('subscription_usage')
      .select('emails_sent_this_month, recipients_created')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching current usage:', fetchError)
      throw fetchError
    }

    const currentEmailCount = currentUsage?.emails_sent_this_month || 0
    const currentRecipientCount = currentUsage?.recipients_created || 0

    // Don't go below 0
    const newRecipientCount = Math.max(0, currentRecipientCount - 1)

    // Update or insert the usage record
    const { error: upsertError } = await adminSupabase
      .from('subscription_usage')
      .upsert({
        user_id: userId,
        month_year: currentMonth,
        emails_sent_this_month: currentEmailCount, // Keep existing email count
        recipients_created: newRecipientCount,
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      console.error('Error decrementing recipient count:', upsertError)
      throw upsertError
    }

    console.log('✅ Recipient count decremented successfully for user:', userId)
  } catch (error) {
    console.error('Error in decrementRecipientCount:', error)
    throw error
  }
}

/**
 * Check if user has access to premium templates
 */
export async function hasPremiumTemplateAccess(userId: string): Promise<boolean> {
  try {
    const adminSupabase = createAdminClient()
    
    // Get user's subscription
    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError)
    }

    const planName = subscription?.plan || 'free'
    const status = subscription?.status || 'active'

    // Try to get plan from database first
    try {
      const { data: plan, error: planError } = await adminSupabase
        .from('plans')
        .select('features')
        .eq('name', planName)
        .eq('is_active', true)
        .single()

      if (!planError && plan) {
        return plan.features?.premiumTemplates === true
      }
    } catch (dbError) {
      console.log('Database plans table not available, using fallback')
    }

    // Fallback to hardcoded logic
    return (planName === 'family' || planName === 'extended') && status === 'active'
  } catch (error) {
    console.error('Error in hasPremiumTemplateAccess:', error)
    return false
  }
}

/**
 * Check if user can schedule emails
 */
export async function canScheduleEmails(userId: string): Promise<boolean> {
  try {
    const adminSupabase = createAdminClient()
    
    // Get user's subscription
    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError)
    }

    const planName = subscription?.plan || 'free'
    const status = subscription?.status || 'active'

    // Try to get plan from database first
    try {
      const { data: plan, error: planError } = await adminSupabase
        .from('plans')
        .select('features')
        .eq('name', planName)
        .eq('is_active', true)
        .single()

      if (!planError && plan) {
        return plan.features?.scheduling === true
      }
    } catch (dbError) {
      console.log('Database plans table not available, using fallback')
    }

    // Fallback to hardcoded logic
    return (planName === 'family' || planName === 'extended') && status === 'active'
  } catch (error) {
    console.error('Error in canScheduleEmails:', error)
    return false
  }
}

/**
 * Get user's plan information for display
 */
export async function getUserPlanInfo(userId: string): Promise<{
  planName: string
  canSendEmails: boolean
  canAddRecipients: boolean
  canAccessPremiumTemplates: boolean
  canScheduleEmails: boolean
  emailLimit: number | null
  recipientLimit: number | null
}> {
  const [limits, canSend, canAdd, hasPremium, canSchedule] = await Promise.all([
    getUserLimits(userId),
    canSendEmail(userId),
    canAddRecipient(userId),
    hasPremiumTemplateAccess(userId),
    canScheduleEmails(userId)
  ])

  return {
    planName: limits.plan_name,
    canSendEmails: canSend,
    canAddRecipients: canAdd,
    canAccessPremiumTemplates: hasPremium,
    canScheduleEmails: canSchedule,
    emailLimit: limits.emails_per_month,
    recipientLimit: limits.recipients_limit
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

/**
 * Cancel all active subscriptions for a user except the specified one
 */
export async function cancelDuplicateSubscriptions(userId: string, keepSubscriptionId?: string): Promise<void> {
  const supabase = createAdminClient()
  
  try {
    // Get all active subscriptions for this user
    const { data: activeSubscriptions, error } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching active subscriptions:', error)
      return
    }

    if (!activeSubscriptions || activeSubscriptions.length <= 1) {
      return // No duplicates to cancel
    }

    // Cancel all except the one we want to keep
    for (const subscription of activeSubscriptions) {
      if (subscription.stripe_subscription_id !== keepSubscriptionId) {
        try {
          // Import stripe here to avoid circular dependencies
          const { stripe } = await import('@/lib/stripe')
          await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
          
          // Update database
          await supabase
            .from('subscriptions')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subscription.stripe_subscription_id)
          
          console.log('Cancelled duplicate subscription:', subscription.stripe_subscription_id)
        } catch (error) {
          console.error('Error cancelling subscription:', subscription.stripe_subscription_id, error)
        }
      }
    }
  } catch (error) {
    console.error('Error in cancelDuplicateSubscriptions:', error)
  }
}
