import { supabase } from './supabase'
import { logScheduledEmailDeleted } from './activity-history'

// Dashboard Stats
export async function getDashboardStats(userId: string) {
  // Use UTC date to avoid system clock issues
  const now = new Date()
  const utcYear = now.getUTCFullYear()
  const utcMonth = now.getUTCMonth() + 1
  const currentMonth = `${utcYear}-${String(utcMonth).padStart(2, '0')}`
  
  console.log('📊 getDashboardStats - User ID:', userId)
  console.log('📊 getDashboardStats - Current month (UTC):', currentMonth)
  
  const [recipientsResult, scheduledEmailsResult, usageResult] = await Promise.all([
    supabase.from('recipients').select('id').eq('user_id', userId).eq('is_active', true),
    supabase.from('scheduled_emails').select('id, status, scheduled_date, scheduled_time').eq('user_id', userId).neq('status', 'sent'),
    supabase.from('subscription_usage').select('emails_sent_this_month').eq('user_id', userId).eq('month_year', currentMonth).single()
  ])

  console.log('📊 getDashboardStats - Usage result:', usageResult)
  console.log('📊 getDashboardStats - Usage data:', usageResult.data)
  console.log('📊 getDashboardStats - Usage error:', usageResult.error)

  const activeRecipients = recipientsResult.data?.length || 0
  const scheduledEmails = scheduledEmailsResult.data?.length || 0
  const sentThisMonth = usageResult.data?.emails_sent_this_month || 0
  
  console.log('📊 getDashboardStats - Final stats:', {
    activeRecipients,
    scheduledEmails,
    sentThisMonth,
    currentMonth
  })
  
  // Find the next scheduled email date
  let nextScheduledDate = null
  if (scheduledEmailsResult.data && scheduledEmailsResult.data.length > 0) {
    // Sort by date and time to find the earliest upcoming email
    const sortedEmails = [...scheduledEmailsResult.data].sort((a, b) => {
      const dateA = new Date(`${a.scheduled_date}T${a.scheduled_time}`)
      const dateB = new Date(`${b.scheduled_date}T${b.scheduled_time}`)
      return dateA.getTime() - dateB.getTime()
    })
    
    const nextEmail = sortedEmails[0]
    if (nextEmail && nextEmail.scheduled_date) {
      // Format the date nicely
      const date = new Date(nextEmail.scheduled_date)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      // Check if it's today, tomorrow, or a specific date
      if (date.toDateString() === today.toDateString()) {
        nextScheduledDate = 'Today'
      } else if (date.toDateString() === tomorrow.toDateString()) {
        nextScheduledDate = 'Tomorrow'
      } else {
        // Format as "Oct 30" or similar
        nextScheduledDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    }
  }
  
  return {
    activeRecipients,
    scheduledEmails,
    sentThisMonth,
    nextScheduledDate
  }
}

// Recent Activity
export async function getRecentActivity(userId: string) {
  const { data: activities, error } = await supabase
    .from('activity_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw error

  return activities?.map(activity => ({
    id: activity.id,
    type: activity.activity_type === 'email_sent' ? 'success' : 'info',
    message: activity.title,
    time: formatTimeAgo(activity.created_at),
    icon: activity.activity_type === 'email_sent' ? 'Check' : 'Calendar'
  })) || []
}

// Recipients
export async function getRecipients(userId: string) {
  const { data, error } = await supabase
    .from('recipients')
    .select('id, name, email, relationship, is_active, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data?.map(recipient => ({
    id: recipient.id,
    name: recipient.name,
    email: recipient.email,
    relationship: recipient.relationship,
    status: recipient.is_active ? 'active' : 'inactive',
    created_at: recipient.created_at
  })) || []
}

// Upcoming Emails
export async function getUpcomingEmails(userId: string) {
  // First get the scheduled emails
  const { data: emails, error: emailsError } = await supabase
    .from('scheduled_emails')
    .select('id, title, scheduled_date, scheduled_time, status, recipient_id')
    .eq('user_id', userId)
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })
    .limit(3)

  if (emailsError) throw emailsError
  if (!emails || emails.length === 0) return []

  // Get recipient IDs
  const recipientIds = emails.map(e => e.recipient_id).filter(Boolean)
  
  // Fetch recipients separately to avoid relationship ambiguity
  const { data: recipients, error: recipientsError } = await supabase
    .from('recipients')
    .select('id, name, email')
    .in('id', recipientIds)

  if (recipientsError) throw recipientsError

  // Create a map for quick lookup
  const recipientMap = new Map(recipients?.map(r => [r.id, r]) || [])

  return emails.map((email) => {
    const recipient = recipientMap.get(email.recipient_id)
    return {
      id: email.id,
      title: email.title,
      recipient: recipient?.name || 'recipient',
      date: formatDate(email.scheduled_date),
      time: formatTime(email.scheduled_time),
      status: email.status
    }
  })
}

// Delete a scheduled email
export async function deleteScheduledEmail(scheduledEmailId: string): Promise<void> {
  // First get the scheduled email info for activity logging
  const { data: scheduledEmail, error: fetchError } = await supabase
    .from('scheduled_emails')
    .select('user_id, title, scheduled_date, recipient_id')
    .eq('id', scheduledEmailId)
    .single()

  if (fetchError) throw fetchError

  // Get recipient info separately to avoid relationship ambiguity
  let recipientName = 'Unknown'
  if (scheduledEmail.recipient_id) {
    const { data: recipient } = await supabase
      .from('recipients')
      .select('first_name, last_name')
      .eq('id', scheduledEmail.recipient_id)
      .single()
    
    if (recipient) {
      recipientName = `${recipient.first_name} ${recipient.last_name || ''}`.trim()
    }
  }

  const { error } = await supabase
    .from('scheduled_emails')
    .delete()
    .eq('id', scheduledEmailId)

  if (error) throw error

  // Log activity
  try {
    await logScheduledEmailDeleted(
      scheduledEmail.user_id,
      scheduledEmail.title,
      recipientName,
      scheduledEmail.scheduled_date
    )
  } catch (activityError) {
    console.error('Failed to log scheduled email deletion activity:', activityError)
    // Don't fail the deletion if activity logging fails
  }
}

// User Preferences
export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  return data || {
    timezone: 'America/New_York',
    email_notifications: true,
    push_notifications: true,
    theme: 'light'
  }
}

// Update User Preferences
export async function updateUserPreferences(userId: string, preferences: any) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    })

  if (error) throw error
  return data
}

// Helper functions
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return `${Math.floor(diffInMinutes / 1440)}d ago`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}
