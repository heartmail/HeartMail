import { supabase } from './supabase'
import { logRecipientActivity } from './activity-history'

export interface Recipient {
  id: string
  first_name: string
  last_name?: string
  name?: string // Keep for backward compatibility
  email: string
  relationship?: string
  birthday?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Get all recipients for a user
export async function getRecipients(userId: string): Promise<Recipient[]> {
  const { data, error } = await supabase
    .from('recipients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Create a new recipient
export async function createRecipient(userId: string, recipientData: Omit<Recipient, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Recipient> {
  const { data, error } = await supabase
    .from('recipients')
    .insert({
      user_id: userId,
      first_name: recipientData.first_name,
      last_name: recipientData.last_name || '',
      email: recipientData.email,
      relationship: recipientData.relationship,
      birthday: recipientData.birthday,
      notes: recipientData.notes,
      is_active: recipientData.is_active
    })
    .select()
    .single()

  if (error) throw error

  // Log activity
  try {
    const fullName = `${recipientData.first_name} ${recipientData.last_name || ''}`.trim()
    await logRecipientActivity(
      userId,
      'recipient_added',
      fullName,
      recipientData.email
    )
  } catch (activityError) {
    console.error('Failed to log recipient activity:', activityError)
    // Don't fail the recipient creation if activity logging fails
  }

  return data
}

// Update a recipient
export async function updateRecipient(recipientId: string, updates: Partial<Omit<Recipient, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Recipient> {
  const { data, error } = await supabase
    .from('recipients')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', recipientId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  try {
    const fullName = `${updates.first_name || ''} ${updates.last_name || ''}`.trim()
    if (fullName && updates.email) {
      await logRecipientActivity(
        data.user_id,
        'recipient_updated',
        fullName,
        updates.email
      )
    }
  } catch (activityError) {
    console.error('Failed to log recipient activity:', activityError)
    // Don't fail the recipient update if activity logging fails
  }

  return data
}

// Delete a recipient
export async function deleteRecipient(recipientId: string): Promise<void> {
  // First get the recipient info for activity logging
  const { data: recipient, error: fetchError } = await supabase
    .from('recipients')
    .select('user_id, first_name, last_name, email')
    .eq('id', recipientId)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from('recipients')
    .delete()
    .eq('id', recipientId)

  if (error) throw error

  // Log activity
  try {
    const fullName = `${recipient.first_name} ${recipient.last_name || ''}`.trim()
    await logRecipientActivity(
      recipient.user_id,
      'recipient_deleted',
      fullName,
      recipient.email
    )
  } catch (activityError) {
    console.error('Failed to log recipient deletion activity:', activityError)
    // Don't fail the deletion if activity logging fails
  }
}

// Get a single recipient
export async function getRecipient(recipientId: string): Promise<Recipient> {
  const { data, error } = await supabase
    .from('recipients')
    .select('*')
    .eq('id', recipientId)
    .single()

  if (error) throw error
  return data
}

// Helper function to get full name
export function getFullName(recipient: Recipient): string {
  if (recipient.first_name && recipient.last_name) {
    return `${recipient.first_name} ${recipient.last_name}`
  } else if (recipient.first_name) {
    return recipient.first_name
  } else if (recipient.name) {
    return recipient.name // Fallback to old name field
  }
  return 'Unknown'
}
