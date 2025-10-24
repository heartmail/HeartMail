import { supabase } from './supabase'
import { addActivity } from './activity-history'
import { hasPremiumTemplateAccess } from './subscription-client'

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
  
  // Check if user has premium template access
  const hasPremiumAccess = await hasPremiumTemplateAccess(userId)
  
  // Filter out premium templates if user doesn't have access
  const filteredTemplates = (data || []).filter(template => {
    if (template.is_premium && !hasPremiumAccess) {
      return false // Hide premium templates for free users
    }
    return true
  })
  
  return filteredTemplates
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

  // Log activity
  try {
    await addActivity(
      userId,
      'template_created',
      `Template created: "${templateData.title}"`,
      `New template added to your collection`
    )
  } catch (activityError) {
    console.error('Failed to log template activity:', activityError)
    // Don't fail the template creation if activity logging fails
  }

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
  // First get the template info for activity logging
  const { data: template, error: fetchError } = await supabase
    .from('templates')
    .select('user_id, title')
    .eq('id', templateId)
    .single()

  if (fetchError) throw fetchError

  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', templateId)

  if (error) throw error

  // Log activity
  try {
    await addActivity(
      template.user_id,
      'template_deleted',
      `Template deleted: "${template.title}"`,
      `Template removed from your collection`
    )
  } catch (activityError) {
    console.error('Failed to log template deletion activity:', activityError)
    // Don't fail the deletion if activity logging fails
  }
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
