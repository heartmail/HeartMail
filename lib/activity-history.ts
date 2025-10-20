import { supabase } from './supabase'

export interface ActivityHistory {
  id: string
  user_id: string
  activity_type: 'email_sent' | 'email_scheduled' | 'recipient_added' | 'recipient_updated' | 'template_created' | 'template_updated' | 'settings_changed'
  title: string
  description?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface ActivityHistoryFilters {
  activity_type?: string
  search?: string
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

// Get all activity history for a user with filters
export async function getActivityHistory(
  userId: string, 
  filters: ActivityHistoryFilters = {}
): Promise<ActivityHistory[]> {
  try {
    let query = supabase
      .from('activity_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.activity_type) {
      query = query.eq('activity_type', filters.activity_type)
    }

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date)
    }

    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching activity history:', error)
      throw new Error('Failed to fetch activity history')
    }

    return data || []
  } catch (error) {
    console.error('Error in getActivityHistory:', error)
    throw error
  }
}

// Get recent activity for dashboard
export async function getRecentActivity(userId: string, limit: number = 5): Promise<ActivityHistory[]> {
  try {
    const { data, error } = await supabase
      .from('activity_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent activity:', error)
      throw new Error('Failed to fetch recent activity')
    }

    return data || []
  } catch (error) {
    console.error('Error in getRecentActivity:', error)
    throw error
  }
}

// Add new activity
export async function addActivity(
  userId: string,
  activityType: ActivityHistory['activity_type'],
  title: string,
  description?: string,
  metadata?: any
): Promise<ActivityHistory> {
  try {
    const { data, error } = await supabase
      .from('activity_history')
      .insert({
        user_id: userId,
        activity_type: activityType,
        title,
        description,
        metadata
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding activity:', error)
      throw new Error('Failed to add activity')
    }

    return data
  } catch (error) {
    console.error('Error in addActivity:', error)
    throw error
  }
}

// Get activity statistics
export async function getActivityStats(userId: string): Promise<{
  total_activities: number
  activities_by_type: Record<string, number>
  recent_activity_count: number
}> {
  try {
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('activity_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      console.error('Error getting total count:', countError)
      throw new Error('Failed to get activity statistics')
    }

    // Get activities by type
    const { data: typeData, error: typeError } = await supabase
      .from('activity_history')
      .select('activity_type')
      .eq('user_id', userId)

    if (typeError) {
      console.error('Error getting activities by type:', typeError)
      throw new Error('Failed to get activity statistics')
    }

    const activitiesByType = typeData?.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Get recent activity count (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentCount, error: recentError } = await supabase
      .from('activity_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())

    if (recentError) {
      console.error('Error getting recent activity count:', recentError)
      throw new Error('Failed to get activity statistics')
    }

    return {
      total_activities: totalCount || 0,
      activities_by_type: activitiesByType,
      recent_activity_count: recentCount || 0
    }
  } catch (error) {
    console.error('Error in getActivityStats:', error)
    throw error
  }
}

// Helper function to add email sent activity
export async function logEmailSent(
  userId: string,
  recipientName: string,
  subject: string,
  emailId?: string
): Promise<void> {
  await addActivity(
    userId,
    'email_sent',
    `Email sent: "${subject}" to ${recipientName}`,
    `Delivered successfully`,
    {
      recipient_name: recipientName,
      subject,
      email_id: emailId
    }
  )
}

// Helper function to add email scheduled activity
export async function logEmailScheduled(
  userId: string,
  recipientName: string,
  subject: string,
  scheduledDate: string,
  emailId?: string
): Promise<void> {
  await addActivity(
    userId,
    'email_scheduled',
    `Email scheduled: "${subject}" to ${recipientName}`,
    `Scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
    {
      recipient_name: recipientName,
      subject,
      scheduled_date: scheduledDate,
      email_id: emailId
    }
  )
}

// Helper function to add recipient activity
export async function logRecipientActivity(
  userId: string,
  activityType: 'recipient_added' | 'recipient_updated',
  recipientName: string,
  recipientEmail: string
): Promise<void> {
  const title = activityType === 'recipient_added' 
    ? `Added ${recipientName} to recipients`
    : `Updated ${recipientName}'s information`
  
  await addActivity(
    userId,
    activityType,
    title,
    `Email: ${recipientEmail}`,
    {
      recipient_name: recipientName,
      recipient_email: recipientEmail
    }
  )
}
