import { supabase } from './supabase'
import { logRecipientActivity } from './activity-history'
import { incrementRecipientCount, decrementRecipientCount } from './subscription'

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
  custom_variables?: Record<string, string>
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
  // Combine first_name and last_name into name field for database compatibility
  const fullName = `${recipientData.first_name} ${recipientData.last_name || ''}`.trim()
  
  const { data, error } = await supabase
    .from('recipients')
    .insert({
      user_id: userId,
      name: fullName,
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

  // Increment recipient count for user
  try {
    await incrementRecipientCount(userId)
    console.log('✅ Recipient count incremented for user:', userId)
  } catch (countError) {
    console.error('Failed to increment recipient count:', countError)
    // Don't fail the recipient creation if count increment fails
  }

  // Log activity
  try {
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
  // Handle name field if first_name or last_name are being updated
  const updateData: any = { ...updates }
  
  if (updates.first_name !== undefined || updates.last_name !== undefined) {
    // Get current recipient data to combine with updates
    const { data: currentData } = await supabase
      .from('recipients')
      .select('first_name, last_name')
      .eq('id', recipientId)
      .single()
    
    const newFirstName = updates.first_name !== undefined ? updates.first_name : currentData?.first_name || ''
    const newLastName = updates.last_name !== undefined ? updates.last_name : currentData?.last_name || ''
    updateData.name = `${newFirstName} ${newLastName}`.trim()
  }
  
  const { data, error } = await supabase
    .from('recipients')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', recipientId)
    .select()
    .single()

  if (error) throw error

  // Log activity
  try {
    const fullName = updateData.name || `${updates.first_name || ''} ${updates.last_name || ''}`.trim()
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

  // Decrement recipient count for user
  try {
    await decrementRecipientCount(recipient.user_id)
    console.log('✅ Recipient count decremented for user:', recipient.user_id)
  } catch (countError) {
    console.error('Failed to decrement recipient count:', countError)
    // Don't fail the recipient deletion if count decrement fails
  }

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
