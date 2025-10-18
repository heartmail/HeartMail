import { supabase } from './supabase'

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
      ...recipientData
    })
    .select()
    .single()

  if (error) throw error
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
  return data
}

// Delete a recipient
export async function deleteRecipient(recipientId: string): Promise<void> {
  const { error } = await supabase
    .from('recipients')
    .delete()
    .eq('id', recipientId)

  if (error) throw error
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
