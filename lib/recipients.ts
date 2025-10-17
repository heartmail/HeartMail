import { supabase } from './supabase'

export interface Recipient {
  id: string
  name: string
  email: string
  relationship?: string
  phone?: string
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
