'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Settings, X, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/lib/auth-context-new'
import { 
  getCustomVariables, 
  createCustomVariable, 
  updateCustomVariable, 
  deleteCustomVariable,
  CustomVariable,
  validateCustomVariableValue 
} from '@/lib/custom-variables'
import { toast } from 'sonner'

export default function VariablesPage() {
  const [variables, setVariables] = useState<CustomVariable[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVariable, setEditingVariable] = useState<CustomVariable | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    type: 'text' as 'text' | 'date' | 'number' | 'email' | 'phone',
    is_required: false,
    validation_rules: {
      minLength: '',
      maxLength: '',
      pattern: ''
    }
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchVariables()
    }
  }, [user])

  const fetchVariables = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await getCustomVariables(user.id)
      setVariables(data)
    } catch (error) {
      console.error('Error fetching variables:', error)
      toast.error('Failed to load custom variables')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validate form
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Variable name is required'
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(formData.name)) {
      errors.name = 'Variable name must start with a letter or underscore and contain only letters, numbers, and underscores'
    }

    if (!formData.label.trim()) {
      errors.label = 'Display label is required'
    }

    if (formData.validation_rules.minLength && isNaN(Number(formData.validation_rules.minLength))) {
      errors.minLength = 'Minimum length must be a number'
    }

    if (formData.validation_rules.maxLength && isNaN(Number(formData.validation_rules.maxLength))) {
      errors.maxLength = 'Maximum length must be a number'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    try {
      const variableData = {
        name: formData.name.trim(),
        label: formData.label.trim(),
        description: formData.description.trim(),
        type: formData.type,
        is_required: formData.is_required,
        validation_rules: {
          minLength: formData.validation_rules.minLength ? Number(formData.validation_rules.minLength) : undefined,
          maxLength: formData.validation_rules.maxLength ? Number(formData.validation_rules.maxLength) : undefined,
          pattern: formData.validation_rules.pattern || undefined
        }
      }

      if (editingVariable) {
        await updateCustomVariable(editingVariable.id, variableData)
        toast.success('Custom variable updated successfully')
      } else {
        await createCustomVariable(user.id, variableData)
        toast.success('Custom variable created successfully')
      }

      await fetchVariables()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving variable:', error)
      toast.error(`Failed to save variable: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEdit = (variable: CustomVariable) => {
    setEditingVariable(variable)
    setFormData({
      name: variable.name,
      label: variable.label,
      description: variable.description || '',
      type: variable.type,
      is_required: variable.is_required,
      validation_rules: {
        minLength: variable.validation_rules.minLength?.toString() || '',
        maxLength: variable.validation_rules.maxLength?.toString() || '',
        pattern: variable.validation_rules.pattern || ''
      }
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (variableId: string) => {
    if (!confirm('Are you sure you want to delete this custom variable? This will remove it from all recipients and templates.')) return

    try {
      await deleteCustomVariable(variableId)
      toast.success('Custom variable deleted successfully')
      await fetchVariables()
    } catch (error) {
      console.error('Error deleting variable:', error)
      toast.error('Failed to delete custom variable')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      description: '',
      type: 'text',
      is_required: false,
      validation_rules: {
        minLength: '',
        maxLength: '',
        pattern: ''
      }
    })
    setValidationErrors({})
    setEditingVariable(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading custom variables...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Variables</h1>
          <p className="text-gray-600 mt-2">
            Create custom fields that can be used in email templates with variables like {'{{nickname}}'}, {'{{favorite_color}}'}, etc.
          </p>
        </div>
        <Button onClick={openAddDialog} className="btn-heartmail">
          <Plus className="h-4 w-4 mr-2" />
          Add Variable
        </Button>
      </div>

      {/* Variables List */}
      {variables.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Custom Variables</h3>
            <p className="text-gray-600 mb-4">
              Create custom variables to personalize your email templates with recipient-specific information.
            </p>
            <Button onClick={openAddDialog} className="btn-heartmail">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Variable
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {variables.map((variable) => (
            <Card key={variable.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {'{{' + variable.name + '}}'}
                      </span>
                      <span>{variable.label}</span>
                      {variable.is_required && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          Required
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {variable.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 capitalize">{variable.type}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(variable)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(variable.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Variable Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {editingVariable ? 'Edit Custom Variable' : 'Create Custom Variable'}
            </DialogTitle>
            <DialogDescription>
              {editingVariable 
                ? 'Update your custom variable settings.'
                : 'Create a new custom field that can be used in email templates.'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Variable Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., nickname"
                    disabled={!!editingVariable}
                    className={validationErrors.name ? 'border-red-500' : ''}
                  />
                  {validationErrors.name && (
                    <p className="text-sm text-red-500">{validationErrors.name}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Used in templates as {'{{' + formData.name + '}}'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Display Label *</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., Nickname"
                    className={validationErrors.label ? 'border-red-500' : ''}
                  />
                  {validationErrors.label && (
                    <p className="text-sm text-red-500">{validationErrors.label}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this variable represents..."
                  rows={3}
                />
              </div>
            </div>

            {/* Type and Validation */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Data Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_required"
                      checked={formData.is_required}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
                    />
                    <Label htmlFor="is_required">Required Field</Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Recipients must provide a value for this variable
                  </p>
                </div>
              </div>

              {/* Validation Rules */}
              <div className="space-y-4">
                <Label>Validation Rules</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLength">Minimum Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={formData.validation_rules.minLength}
                      onChange={(e) => setFormData({
                        ...formData,
                        validation_rules: { ...formData.validation_rules, minLength: e.target.value }
                      })}
                      placeholder="e.g., 3"
                      className={validationErrors.minLength ? 'border-red-500' : ''}
                    />
                    {validationErrors.minLength && (
                      <p className="text-sm text-red-500">{validationErrors.minLength}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLength">Maximum Length</Label>
                    <Input
                      id="maxLength"
                      type="number"
                      value={formData.validation_rules.maxLength}
                      onChange={(e) => setFormData({
                        ...formData,
                        validation_rules: { ...formData.validation_rules, maxLength: e.target.value }
                      })}
                      placeholder="e.g., 50"
                      className={validationErrors.maxLength ? 'border-red-500' : ''}
                    />
                    {validationErrors.maxLength && (
                      <p className="text-sm text-red-500">{validationErrors.maxLength}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-heartmail">
                <Save className="h-4 w-4 mr-2" />
                {editingVariable ? 'Update Variable' : 'Create Variable'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
