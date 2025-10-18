import { supabase } from './supabase'

export interface UserProfile {
  id: string
  email: string
  display_name?: string
  created_at: string
}

// Get user profile by UUID
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return {
      id: data.id,
      email: data.email,
      created_at: data.created_at
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

// Get user profile by email
export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching user profile by email:', error)
      return null
    }

    return {
      id: data.id,
      email: data.email,
      created_at: data.created_at
    }
  } catch (error) {
    console.error('Error in getUserProfileByEmail:', error)
    return null
  }
}

// Get user's email for display purposes
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const profile = await getUserProfile(userId)
    return profile?.email || null
  } catch (error) {
    console.error('Error getting user email:', error)
    return null
  }
}

// Update existing data for "pearsonrhill2" user
export async function updateUserDataForEmail(email: string): Promise<boolean> {
  try {
    // First, find the user by email
    const userProfile = await getUserProfileByEmail(email)
    if (!userProfile) {
      console.error(`User with email ${email} not found`)
      return false
    }

    console.log(`Found user: ${userProfile.email} with ID: ${userProfile.id}`)
    
    // Now you can update any existing data that needs to be associated with this user
    // For example, if you have orphaned records that should belong to this user:
    
    // Update recipients table
    const { error: recipientsError } = await supabase
      .from('recipients')
      .update({ user_id: userProfile.id })
      .is('user_id', null) // Only update records with null user_id
    
    if (recipientsError) {
      console.error('Error updating recipients:', recipientsError)
    }

    // Update templates table
    const { error: templatesError } = await supabase
      .from('templates')
      .update({ user_id: userProfile.id })
      .is('user_id', null)
    
    if (templatesError) {
      console.error('Error updating templates:', templatesError)
    }

    // Update scheduled_emails table
    const { error: scheduledEmailsError } = await supabase
      .from('scheduled_emails')
      .update({ user_id: userProfile.id })
      .is('user_id', null)
    
    if (scheduledEmailsError) {
      console.error('Error updating scheduled_emails:', scheduledEmailsError)
    }

    // Update activity_history table
    const { error: activityError } = await supabase
      .from('activity_history')
      .update({ user_id: userProfile.id })
      .is('user_id', null)
    
    if (activityError) {
      console.error('Error updating activity_history:', activityError)
    }

    console.log(`Successfully updated data for user: ${email}`)
    return true
  } catch (error) {
    console.error('Error updating user data:', error)
    return false
  }
}

// Helper function to display user info in UI
export function formatUserDisplay(user: UserProfile | null): string {
  if (!user) return 'Unknown User'
  return user.email
}

// Helper function to get user initials for avatars
export function getUserInitials(user: UserProfile | null): string {
  if (!user) return 'U'
  const email = user.email
  const name = email.split('@')[0]
  return name.substring(0, 2).toUpperCase()
}
