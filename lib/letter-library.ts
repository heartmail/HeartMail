import { supabase } from './supabase'

export interface LetterTemplate {
  id: string
  title: string
  category: string
  description: string
  content: string
  is_featured: boolean
  is_premium: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  template_count: number
  created_at: string
}

// Get all public templates for Letter Library
export async function getPublicTemplates(): Promise<LetterTemplate[]> {
  const { data, error } = await supabase
    .from('letter_templates')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get featured templates
export async function getFeaturedTemplates(): Promise<LetterTemplate[]> {
  const { data, error } = await supabase
    .from('letter_templates')
    .select('*')
    .eq('is_public', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) throw error
  return data || []
}

// Get templates by category
export async function getTemplatesByCategory(category: string): Promise<LetterTemplate[]> {
  const { data, error } = await supabase
    .from('letter_templates')
    .select('*')
    .eq('is_public', true)
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('template_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

// Search templates
export async function searchTemplates(query: string): Promise<LetterTemplate[]> {
  const { data, error } = await supabase
    .from('letter_templates')
    .select('*')
    .eq('is_public', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get template by ID
export async function getTemplateById(id: string): Promise<LetterTemplate | null> {
  const { data, error } = await supabase
    .from('letter_templates')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .single()

  if (error) throw error
  return data || null
}
