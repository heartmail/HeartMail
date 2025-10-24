import { supabase } from './supabase'

export interface PlanLimits {
  plan_name: string
  recipients_limit: number | null
  templates_limit: number | null
  emails_per_month: number | null
}

export interface SubscriptionUsage {
  id: string
  user_id: string
  emails_sent_this_month: number
  recipients_created: number
  month_year: string
  created_at: string
  updated_at: string
}

/**
 * Client-side version of getUserLimits - uses regular supabase client
 */
export async function getUserLimits(userId: string): Promise<PlanLimits> {
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const planName = subscription?.plan || 'free'
    return getDefaultLimits(planName)
  } catch (error) {
    console.error('Error in getUserLimits (client-side):', error)
    return getDefaultLimits('free')
  }
}

/**
 * Client-side version of getUserUsage - uses regular supabase client
 */
export async function getUserUsage(userId: string): Promise<SubscriptionUsage | null> {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    
    const { data: usage } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single()

    return usage
  } catch (error) {
    console.error('Error in getUserUsage (client-side):', error)
    return null
  }
}

/**
 * Client-side version of canSendEmail
 */
export async function canSendEmail(userId: string): Promise<boolean> {
  try {
    const [limits, usage] = await Promise.all([
      getUserLimits(userId),
      getUserUsage(userId)
    ])

    if (limits.emails_per_month === null) {
      return true // Unlimited
    }

    const emailsSent = usage?.emails_sent_this_month || 0
    return emailsSent < limits.emails_per_month
  } catch (error) {
    console.error('Error in canSendEmail (client-side):', error)
    return false
  }
}

/**
 * Client-side version of canAddRecipient
 */
export async function canAddRecipient(userId: string): Promise<boolean> {
  try {
    const [limits, usage] = await Promise.all([
      getUserLimits(userId),
      getUserUsage(userId)
    ])

    if (limits.recipients_limit === null) {
      return true // Unlimited
    }

    const recipientsCreated = usage?.recipients_created || 0
    return recipientsCreated < limits.recipients_limit
  } catch (error) {
    console.error('Error in canAddRecipient (client-side):', error)
    return false
  }
}

/**
 * Client-side version of hasPremiumTemplateAccess
 */
export async function hasPremiumTemplateAccess(userId: string): Promise<boolean> {
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return false
    }

    // Family and Extended plans have premium template access
    return subscription.plan === 'family' || subscription.plan === 'extended'
  } catch (error) {
    console.error('Error in hasPremiumTemplateAccess (client-side):', error)
    return false
  }
}

/**
 * Client-side version of canScheduleEmails
 */
export async function canScheduleEmails(userId: string): Promise<boolean> {
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return false
    }

    // Family and Extended plans can schedule emails
    return subscription.plan === 'family' || subscription.plan === 'extended'
  } catch (error) {
    console.error('Error in canScheduleEmails (client-side):', error)
    return false
  }
}

/**
 * Get default limits based on plan name
 */
function getDefaultLimits(planName: string): PlanLimits {
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
}
