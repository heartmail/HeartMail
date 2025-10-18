import { supabase } from './supabase'

export interface UserProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    throw error
  }
  return data
}

// Create or update user profile
export async function upsertUserProfile(userId: string, profileData: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
