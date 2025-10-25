'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Palette, Eye, Copy, Heart, Mail, MessageSquare, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, Template } from '@/lib/templates'
import { TEMPLATE_VARIABLES, getAllAvailableVariables } from '@/lib/template-variables'
import { getCustomVariableNames } from '@/lib/custom-variables'
import { toast } from 'sonner'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as Template['category'],
    is_premium: false,
    is_public: false,
    tags: [] as string[]
  })
  const [availableVariables, setAvailableVariables] = useState(TEMPLATE_VARIABLES)
  const [customVariableNames, setCustomVariableNames] = useState<string[]>([])
  const [newCustomVarName, setNewCustomVarName] = useState('')
  const [showCustomVarDialog, setShowCustomVarDialog] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])

  const { user } = useAuth()

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = formData.content
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      const newContent = before + variable + after
      
      setFormData({ ...formData, content: newContent })
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
  }

  const removeVariable = (variableKey: string) => {
    setAvailableVariables(prev => prev.filter(variable => variable.key !== variableKey))
  }

  const createCustomVariable = () => {
    if (newCustomVarName.trim()) {
      const varName = newCustomVarName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      const variable = `{{${varName}}}`
      
      // Add to available variables
      const newVar = {
        key: variable,
        label: varName.charAt(0).toUpperCase() + varName.slice(1).replace(/_/g, ' '),
        description: `Custom variable: ${varName}`
      }
      
      setAvailableVariables(prev => [...prev, newVar])
      setCustomVariableNames(prev => [...prev, varName])
      
      // Insert into content
      insertVariable(variable)
      
      setNewCustomVarName('')
      setShowCustomVarDialog(false)
      toast.success(`Custom variable ${variable} created and inserted`)
    }
  }

  const categories = [
    { value: 'love', label: 'Love & Affection' },
    { value: 'family', label: 'Family' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'holiday', label: 'Holidays' },
    { value: 'birthday', label: 'Birthdays' },
    { value: 'general', label: 'General' }
  ]

  useEffect(() => {
    if (user) {
      fetchTemplates()
      loadCustomVariables()
    }
  }, [user])

  const loadCustomVariables = async () => {
    if (!user) return
    
    try {
      const customVars = await getCustomVariableNames(user.id)
      setCustomVariableNames(customVars)
      
      // Create template variables from custom variable names
      const customTemplateVars = customVars.map(name => ({
        key: `{{${name}}}`,
        label: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
        description: `Custom variable: ${name}`
      }))
      
      setAvailableVariables([...TEMPLATE_VARIABLES, ...customTemplateVars])
    } catch (error) {
      console.error('Error loading custom variables:', error)
    }
  }

  // Filter templates based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTemplates(templates)
    } else {
      const filtered = templates.filter(template =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredTemplates(filtered)
    }
  }, [templates, searchQuery])

  const fetchTemplates = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await getTemplates(user.id)
      setTemplates(data)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      console.error('No user found')
      toast.error('You must be logged in to create templates')
      return
    }

    console.log('Submitting template:', formData)
    console.log('User ID:', user.id)

    try {
      if (editingTemplate) {
        console.log('Updating template:', editingTemplate.id)
        await updateTemplate(editingTemplate.id, formData)
        toast.success('Template updated successfully')
      } else {
        console.log('Creating new template')
        await createTemplate(user.id, formData)
        toast.success('Template created successfully')
      }
      
      await fetchTemplates()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error(`Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormData({
      title: template.title,
      content: template.content,
      category: template.category,
      is_premium: template.is_premium,
      is_public: template.is_public,
      tags: template.tags || []
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await deleteTemplate(templateId)
      toast.success('Template deleted successfully')
      await fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleCopy = (template: Template) => {
    setFormData({
      title: `${template.title} (Copy)`,
      content: template.content,
      category: template.category,
      is_premium: false,
      is_public: false,
      tags: template.tags || []
    })
    setEditingTemplate(null)
    setIsDialogOpen(true)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      is_premium: false,
      is_public: false,
      tags: []
    })
    setTagInput('')
    setEditingTemplate(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-1">
            Create and manage your email templates
            {templates.length > 0 && (
              <span className="ml-2 text-heartmail-pink font-semibold">
                ({templates.length} template{templates.length !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button 
              className="btn-heartmail"
              onClick={(e) => {
                console.log('🔍 Create Template button clicked!', e)
                e.preventDefault()
                e.stopPropagation()
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
            aria-describedby="template-form-description"
          >
            <div id="template-form-description" className="sr-only">
              Create a new email template with title, content, and category selection.
            </div>
            <DialogHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    {editingTemplate ? 'Edit Your Template' : 'Create a Heartfelt Template'}
                  </DialogTitle>
                  <DialogDescription className="text-pink-100 mt-1">
                    {editingTemplate ? 'Update your loving message below.' : 'Craft a beautiful template to share your love.'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Template Title Card */}
              <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-pink-500" />
                    What should we call this template?
                  </CardTitle>
                  <CardDescription>
                    Give your template a loving name
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="My Weekly Love Letter"
                    className="form-input"
                    required
                  />
                </CardContent>
              </Card>
              
              {/* Category Card */}
              <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5 text-pink-500" />
                    What type of love is this?
                  </CardTitle>
                  <CardDescription>
                    Choose the category that best fits your message
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={formData.category} onValueChange={(value: Template['category']) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              {/* Content Card */}
              <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-pink-500" />
                    Body/Message
                  </CardTitle>
                  <CardDescription>
                    Write the beautiful message you want to share
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Variable Insertion Buttons */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Insert Variables
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomVarDialog(true)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Create Custom
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableVariables.map((variable) => (
                        <div key={variable.key} className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable(variable.key)}
                            className="text-xs rounded-r-none border-r-0"
                            title={variable.description}
                          >
                            {variable.label}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariable(variable.key)}
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-l-none px-2"
                            title="Remove variable"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Click any button above to insert variables that will be replaced with recipient information
                    </p>
                  </div>
                  
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Hi {'{{first_name}}'}!&#10;&#10;I just wanted to take a moment to tell you how much you mean to me..."
                    rows={8}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Use variables like {'{{first_name}}'}, {'{{last_name}}'}, {'{{full_name}}'}, {'{{email}}'}, {'{{relationship}}'}
                  </p>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    className="form-input"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_premium"
                    checked={formData.is_premium}
                    onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_premium">Premium template</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_public">Make public (share with other users)</Label>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleDialogClose}
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-semibold py-3 px-6 rounded-lg"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No templates match "${searchQuery}". Try a different search term.`
                : 'Create your first template to start sending personalized emails'
              }
            </p>
            <Button className="btn-heartmail" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-heartmail-pink rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <CardDescription>
                        {categories.find(c => c.value === template.category)?.label || template.category}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(template)}
                      title="Copy template"
                      className="icon-btn"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(template)}
                      className="icon-btn"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="icon-btn text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {template.content}
                </p>
                
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    {template.is_premium && (
                      <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                        Premium
                      </Badge>
                    )}
                    {template.is_public && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Public
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(template.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Custom Variable Creation Dialog */}
      <Dialog open={showCustomVarDialog} onOpenChange={setShowCustomVarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Custom Variable
            </DialogTitle>
            <DialogDescription>
              Create a new custom variable that can be used in your templates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customVarName">Variable Name</Label>
              <Input
                id="customVarName"
                value={newCustomVarName}
                onChange={(e) => setNewCustomVarName(e.target.value)}
                placeholder="e.g., nickname, favorite_color, anniversary"
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Will be used as {'{{' + (newCustomVarName || 'variable_name') + '}}'} in templates
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCustomVarDialog(false)
                  setNewCustomVarName('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={createCustomVariable}
                disabled={!newCustomVarName.trim()}
                className="btn-heartmail"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create & Insert
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}