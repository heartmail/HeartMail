import { supabase } from './supabase'

export interface Template {
  id: string
  title: string
  content: string
  category: 'love' | 'family' | 'health' | 'holiday' | 'birthday' | 'general'
  is_premium: boolean
  is_public: boolean
  tags?: string[]
  created_at: string
  updated_at: string
}

// Get all templates for a user
export async function getTemplates(userId: string): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get public templates (for template library)
export async function getPublicTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Create a new template
export async function createTemplate(userId: string, templateData: Omit<Template, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .insert({
      user_id: userId,
      ...templateData
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update a template
export async function updateTemplate(templateId: string, updates: Partial<Omit<Template, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a template
export async function deleteTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', templateId)

  if (error) throw error
}

// Get a single template
export async function getTemplate(templateId: string): Promise<Template> {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) throw error
  return data
}
