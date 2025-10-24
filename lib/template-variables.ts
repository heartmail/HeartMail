export interface RecipientData {
  first_name: string
  last_name: string
  email: string
  relationship?: string
  custom_variables?: Record<string, string>
}

export interface TemplateVariable {
  key: string
  label: string
  description: string
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    key: '{{first_name}}',
    label: 'First Name',
    description: "Recipient's first name"
  },
  {
    key: '{{last_name}}',
    label: 'Last Name', 
    description: "Recipient's last name"
  },
  {
    key: '{{full_name}}',
    label: 'Full Name',
    description: "Recipient's first and last name"
  },
  {
    key: '{{email}}',
    label: 'Email',
    description: "Recipient's email address"
  },
  {
    key: '{{relationship}}',
    label: 'Relationship',
    description: "Your relationship to the recipient"
  }
]

/**
 * Replace template variables with actual recipient data
 */
export function replaceTemplateVariables(template: string, recipient: RecipientData): string {
  let result = template
  
  // Replace built-in variables
  result = result.replace(/\{\{first_name\}\}/g, recipient.first_name || '')
  result = result.replace(/\{\{last_name\}\}/g, recipient.last_name || '')
  result = result.replace(/\{\{full_name\}\}/g, `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim())
  result = result.replace(/\{\{email\}\}/g, recipient.email || '')
  result = result.replace(/\{\{relationship\}\}/g, recipient.relationship || '')
  
  // Replace custom variables
  if (recipient.custom_variables) {
    Object.entries(recipient.custom_variables).forEach(([key, value]) => {
      const variableKey = `{{${key}}}`
      result = result.replace(new RegExp(variableKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value || '')
    })
  }
  
  return result
}

/**
 * Check if template contains any variables
 */
export function hasTemplateVariables(template: string): boolean {
  return TEMPLATE_VARIABLES.some(variable => template.includes(variable.key))
}

/**
 * Get all variables used in a template
 */
export function getTemplateVariables(template: string): string[] {
  const variables: string[] = []
  TEMPLATE_VARIABLES.forEach(variable => {
    if (template.includes(variable.key)) {
      variables.push(variable.key)
    }
  })
  return variables
}

/**
 * Insert a variable into text at cursor position
 */
export function insertVariableAtCursor(
  textarea: HTMLTextAreaElement, 
  variable: string
): string {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value
  const before = text.substring(0, start)
  const after = text.substring(end, text.length)
  
  return before + variable + after
}

/**
 * Get all custom variables from a template
 */
export function getCustomVariablesFromTemplate(template: string): string[] {
  const customVarRegex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g
  const variables: string[] = []
  let match
  
  while ((match = customVarRegex.exec(template)) !== null) {
    const varName = match[1]
    // Only include variables that are not built-in
    if (!TEMPLATE_VARIABLES.some(v => v.key === `{{${varName}}}`)) {
      if (!variables.includes(varName)) {
        variables.push(varName)
      }
    }
  }
  
  return variables
}

/**
 * Check if template contains custom variables
 */
export function hasCustomVariables(template: string): boolean {
  return getCustomVariablesFromTemplate(template).length > 0
}

/**
 * Get all variables (built-in + custom) from a template
 */
export function getAllTemplateVariables(template: string): string[] {
  const builtInVars = getTemplateVariables(template)
  const customVars = getCustomVariablesFromTemplate(template)
  return [...builtInVars, ...customVars]
}

/**
 * Get all available variables for a user (built-in + custom)
 */
export async function getAllAvailableVariables(userId: string): Promise<TemplateVariable[]> {
  try {
    // Import custom variables dynamically to avoid circular dependency
    const { getCustomVariables } = await import('@/lib/custom-variables')
    const customVars = await getCustomVariables(userId)
    
    // Convert custom variables to template variables format
    const customTemplateVars: TemplateVariable[] = customVars.map(cv => ({
      key: `{{${cv.name}}}`,
      label: cv.label,
      description: cv.description || `Custom variable: ${cv.name}`
    }))
    
    return [...TEMPLATE_VARIABLES, ...customTemplateVars]
  } catch (error) {
    console.error('Error fetching custom variables:', error)
    return TEMPLATE_VARIABLES
  }
}

/**
 * Check if template has any unreplaced variables
 */
export function hasUnreplacedVariables(template: string): boolean {
  const variableRegex = /\{\{[^}]+\}\}/g
  return variableRegex.test(template)
}

/**
 * Get list of unreplaced variables from template
 */
export function getUnreplacedVariables(template: string): string[] {
  const variableRegex = /\{\{([^}]+)\}\}/g
  const variables: string[] = []
  let match
  
  while ((match = variableRegex.exec(template)) !== null) {
    variables.push(match[1])
  }
  
  return variables
}
