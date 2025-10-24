'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Mail, Calendar, Heart, User, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { getRecipients, createRecipient, updateRecipient, deleteRecipient, Recipient, getFullName } from '@/lib/recipients'
import { canAddRecipient, getUserUsage, getUserLimits } from '@/lib/subscription'
import UpgradeModal from '@/components/billing/upgrade-modal'
import { toast } from 'sonner'

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredRecipients, setFilteredRecipients] = useState<Recipient[]>([])
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    relationship: '',
    birthday: '',
    notes: '',
    is_active: true
  })
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({})
  const [newCustomVarName, setNewCustomVarName] = useState('')
  const [newCustomVarValue, setNewCustomVarValue] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeModalType, setUpgradeModalType] = useState<'emails' | 'recipients' | 'templates' | 'scheduling'>('recipients')
  const [currentUsage, setCurrentUsage] = useState(0)
  const [currentLimit, setCurrentLimit] = useState(0)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchRecipients()
    }
  }, [user])

  // Custom variable functions
  const addCustomVariable = () => {
    if (newCustomVarName.trim() && newCustomVarValue.trim()) {
      setCustomVariables(prev => ({
        ...prev,
        [newCustomVarName.trim()]: newCustomVarValue.trim()
      }))
      setNewCustomVarName('')
      setNewCustomVarValue('')
    }
  }

  const removeCustomVariable = (key: string) => {
    setCustomVariables(prev => {
      const newVars = { ...prev }
      delete newVars[key]
      return newVars
    })
  }

  const updateCustomVariable = (key: string, value: string) => {
    setCustomVariables(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Filter recipients based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecipients(recipients)
    } else {
      const filtered = recipients.filter(recipient =>
        getFullName(recipient).toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.relationship?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredRecipients(filtered)
    }
  }, [recipients, searchQuery])

  const fetchRecipients = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const data = await getRecipients(user.id)
      setRecipients(data)
    } catch (error) {
      console.error('Error fetching recipients:', error)
      toast.error('Failed to load recipients')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      console.error('No user found')
      toast.error('You must be logged in to add recipients')
      return
    }

    // Check if user can add recipients (only for new recipients, not updates)
    if (!editingRecipient) {
      const canAdd = await canAddRecipient(user.id)
      if (!canAdd) {
        // Get current usage and limits
        const [usage, limits] = await Promise.all([
          getUserUsage(user.id),
          getUserLimits(user.id)
        ])
        
        setCurrentUsage(usage?.recipients_count || 0)
        setCurrentLimit(limits.recipients_limit)
        setUpgradeModalType('recipients')
        setShowUpgradeModal(true)
        return
      }
    }

    console.log('Submitting recipient:', formData)
    console.log('User ID:', user.id)

    try {
      const recipientData = {
        ...formData,
        custom_variables: customVariables
      }
      
      if (editingRecipient) {
        console.log('Updating recipient:', editingRecipient.id)
        await updateRecipient(editingRecipient.id, recipientData)
        toast.success('Recipient updated successfully')
      } else {
        console.log('Creating new recipient')
        await createRecipient(user.id, recipientData)
        toast.success('Recipient added successfully')
      }
      
      await fetchRecipients()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving recipient:', error)
      toast.error(`Failed to save recipient: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEdit = (recipient: Recipient) => {
    setEditingRecipient(recipient)
    setFormData({
      first_name: recipient.first_name || '',
      last_name: recipient.last_name || '',
      email: recipient.email,
      relationship: recipient.relationship || '',
      birthday: recipient.birthday || '',
      notes: recipient.notes || '',
      is_active: recipient.is_active
    })
    setCustomVariables(recipient.custom_variables || {})
    setIsDialogOpen(true)
  }

  const handleDelete = async (recipientId: string) => {
    if (!confirm('Are you sure you want to delete this recipient?')) return

    try {
      await deleteRecipient(recipientId)
      toast.success('Recipient deleted successfully')
      await fetchRecipients()
    } catch (error) {
      console.error('Error deleting recipient:', error)
      toast.error('Failed to delete recipient')
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      relationship: '',
      birthday: '',
      notes: '',
      is_active: true
    })
    setCustomVariables({})
    setNewCustomVarName('')
    setNewCustomVarValue('')
    setEditingRecipient(null)
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
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading recipients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipients</h1>
          <p className="text-gray-600 mt-1">
            Manage your loved ones who will receive your heartfelt emails
            {recipients.length > 0 && (
              <span className="ml-2 text-heartmail-pink font-semibold">
                ({recipients.length} recipient{recipients.length !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button 
              className="btn-heartmail"
              onClick={(e) => {
                console.log('🔍 Add Recipient button clicked!', e)
                e.preventDefault()
                e.stopPropagation()
                resetForm()
                setIsDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recipient
            </Button>
          </DialogTrigger>
          <DialogContent 
            className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
            aria-describedby="recipient-form-description"
          >
            <div id="recipient-form-description" className="sr-only">
              Add a new recipient to your HeartMail contact list.
            </div>
            <DialogHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">
                    {editingRecipient ? 'Update Your Loved One' : 'Add Someone Special'}
                  </DialogTitle>
                  <DialogDescription className="text-pink-100 mt-1">
                    {editingRecipient ? 'Keep their information up to date.' : 'Add someone you care about to your HeartMail list.'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Card */}
              <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-pink-500" />
                    What's their name?
                  </CardTitle>
                  <CardDescription>
                    Tell us who this special person is
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="First name"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Last name"
                        className="form-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Contact Card */}
              <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5 text-pink-500" />
                    How can we reach them?
                  </CardTitle>
                  <CardDescription>
                    Their email address and your relationship
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="their.email@example.com"
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Select value={formData.relationship} onValueChange={(value) => setFormData({ ...formData, relationship: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="How are you related?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grandparent">Grandparent</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              
              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday (Optional)</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special notes about this recipient"
                  rows={3}
                />
              </div>

              {/* Custom Variables Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-lg font-semibold">Custom Variables</Label>
                  <span className="text-sm text-gray-500">(Optional)</span>
                </div>
                <p className="text-sm text-gray-600">
                  Add custom fields that can be used in email templates with variables like {'{{nickname}}'}, {'{{favorite_color}}'}, etc.
                </p>
                
                {/* Add new custom variable */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Variable name (e.g., nickname)"
                    value={newCustomVarName}
                    onChange={(e) => setNewCustomVarName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={newCustomVarValue}
                    onChange={(e) => setNewCustomVarValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addCustomVariable}
                    disabled={!newCustomVarName.trim() || !newCustomVarValue.trim()}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>

                {/* Display existing custom variables */}
                {Object.entries(customVariables).length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Current Variables:</Label>
                    {Object.entries(customVariables).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="font-mono text-sm">{'{{' + key + '}}'}</span>
                        <span className="text-gray-500">=</span>
                        <Input
                          value={value}
                          onChange={(e) => updateCustomVariable(key, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCustomVariable(key)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active">Active recipient</Label>
              </div>
              
              <div className="flex space-x-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDialogClose}
                  className="flex-1 py-3 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 py-3 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  {editingRecipient ? 'Update Recipient' : 'Add Recipient'}
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
            placeholder="Search recipients..."
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

      {filteredRecipients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No recipients found' : 'No recipients yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No recipients match "${searchQuery}". Try a different search term.`
                : 'Add your first recipient to start sending heartfelt emails'
              }
            </p>
            <Button className="btn-heartmail" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Recipient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipients.map((recipient) => (
            <Card key={recipient.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-heartmail-pink rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{getFullName(recipient)}</CardTitle>
                      <CardDescription>{recipient.relationship || 'Loved one'}</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(recipient)}
                      className="icon-btn"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(recipient.id)}
                      className="icon-btn text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{recipient.email}</span>
                </div>
                {recipient.birthday && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Born: {new Date(recipient.birthday).toLocaleDateString()}</span>
                  </div>
                )}
                {recipient.notes && (
                  <p className="text-sm text-gray-600 mt-2">{recipient.notes}</p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    recipient.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {recipient.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType={upgradeModalType}
        currentUsage={currentUsage}
        currentLimit={currentLimit}
      />
    </div>
  )
}