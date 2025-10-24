import { supabase } from './supabase'

export interface CustomVariable {
  id: string
  user_id: string
  name: string
  label: string
  description?: string
  created_at: string
  updated_at: string
}

// Get all custom variable names used across all recipients for a user
export async function getCustomVariableNames(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .rpc('get_user_custom_variables', { user_id_param: userId })

  if (error) {
    console.error('Error fetching custom variable names:', error)
    return []
  }

  return data || []
}

// Get custom variable values for a recipient
export async function getRecipientCustomVariables(recipientId: string): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('recipients')
    .select('custom_variables')
    .eq('id', recipientId)
    .single()

  if (error) {
    console.error('Error fetching recipient custom variables:', error)
    return {}
  }

  return data?.custom_variables || {}
}

// Update recipient's custom variable values
export async function updateRecipientCustomVariables(
  recipientId: string,
  customVariables: Record<string, string>
): Promise<void> {
  const { error } = await supabase
    .from('recipients')
    .update({
      custom_variables: customVariables,
      updated_at: new Date().toISOString()
    })
    .eq('id', recipientId)

  if (error) {
    console.error('Error updating recipient custom variables:', error)
    throw error
  }
}

// Get all custom variables used in a template
export function getCustomVariablesFromTemplate(template: string): string[] {
  const customVarRegex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g
  const variables: string[] = []
  let match
  
  while ((match = customVarRegex.exec(template)) !== null) {
    const varName = match[1]
    // Only include variables that are not built-in
    const builtInVars = ['first_name', 'last_name', 'full_name', 'email', 'relationship']
    if (!builtInVars.includes(varName)) {
      if (!variables.includes(varName)) {
        variables.push(varName)
      }
    }
  }
  
  return variables
}

// Check if template has unreplaced variables
export function hasUnreplacedVariables(template: string): boolean {
  const variableRegex = /\{\{[^}]+\}\}/g
  return variableRegex.test(template)
}

// Get unreplaced variables from template
export function getUnreplacedVariables(template: string): string[] {
  const variableRegex = /\{\{([^}]+)\}\}/g
  const variables: string[] = []
  let match
  
  while ((match = variableRegex.exec(template)) !== null) {
    variables.push(match[1])
  }
  
  return variables
}

// Get all custom variables for a user
export async function getCustomVariables(userId: string): Promise<CustomVariable[]> {
  const { data, error } = await supabase
    .from('custom_variables')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching custom variables:', error)
    return []
  }

  return data || []
}

// Create a new custom variable
export async function createCustomVariable(
  userId: string,
  variable: Omit<CustomVariable, 'id' | 'created_at' | 'updated_at'>
): Promise<void> {
  const { error } = await supabase
    .from('custom_variables')
    .insert({
      user_id: userId,
      name: variable.name,
      label: variable.label,
      description: variable.description
    })

  if (error) {
    console.error('Error creating custom variable:', error)
    throw error
  }
}

// Update a custom variable
export async function updateCustomVariable(
  variableId: string,
  updates: Partial<CustomVariable>
): Promise<void> {
  const { error } = await supabase
    .from('custom_variables')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', variableId)

  if (error) {
    console.error('Error updating custom variable:', error)
    throw error
  }
}

// Delete a custom variable
export async function deleteCustomVariable(variableId: string): Promise<void> {
  const { error } = await supabase
    .from('custom_variables')
    .delete()
    .eq('id', variableId)

  if (error) {
    console.error('Error deleting custom variable:', error)
    throw error
  }
}

// Validate custom variable value
export function validateCustomVariableValue(value: string): boolean {
  // Basic validation - can be extended as needed
  return value.trim().length > 0
}
