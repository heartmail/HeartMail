'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Users, Mail, Phone, Calendar, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { getRecipients, createRecipient, updateRecipient, deleteRecipient, Recipient } from '@/lib/recipients'
import { toast } from 'sonner'

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    relationship: '',
    phone: '',
    birthday: '',
    notes: '',
    is_active: true
  })

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchRecipients()
    }
  }, [user])

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

    console.log('Submitting recipient:', formData)
    console.log('User ID:', user.id)

    try {
      if (editingRecipient) {
        console.log('Updating recipient:', editingRecipient.id)
        await updateRecipient(editingRecipient.id, formData)
        toast.success('Recipient updated successfully')
      } else {
        console.log('Creating new recipient')
        await createRecipient(user.id, formData)
        toast.success('Recipient added successfully')
      }
      
      await fetchRecipients()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving recipient:', error)
      toast.error(`Failed to save recipient: ${error.message || 'Unknown error'}`)
    }
  }

  const handleEdit = (recipient: Recipient) => {
    setEditingRecipient(recipient)
    setFormData({
      name: recipient.name,
      email: recipient.email,
      relationship: recipient.relationship || '',
      phone: recipient.phone || '',
      birthday: recipient.birthday || '',
      notes: recipient.notes || '',
      is_active: recipient.is_active
    })
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
      name: '',
      email: '',
      relationship: '',
      phone: '',
      birthday: '',
      notes: '',
      is_active: true
    })
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
          <p className="text-gray-600 mt-1">Manage your loved ones who will receive your heartfelt emails</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="btn-heartmail" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingRecipient ? 'Edit Recipient' : 'Add New Recipient'}</DialogTitle>
              <DialogDescription>
                {editingRecipient ? 'Update the recipient information below.' : 'Add a new recipient to your HeartMail list.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter recipient's name"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select value={formData.relationship} onValueChange={(value) => setFormData({ ...formData, relationship: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
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
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  className="form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  className="form-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special notes about this recipient"
                  rows={3}
                />
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-heartmail">
                  {editingRecipient ? 'Update Recipient' : 'Add Recipient'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Debug button */}
        <Button 
          className="btn-heartmail ml-4" 
          onClick={() => {
            console.log('🔍 DEBUG: Direct button clicked!')
            setIsDialogOpen(true)
          }}
        >
          DEBUG: Open Dialog
        </Button>
      </div>

      {recipients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recipients yet</h3>
            <p className="text-gray-600 mb-6">Add your first recipient to start sending heartfelt emails</p>
            <Button className="btn-heartmail" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Recipient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipients.map((recipient) => (
            <Card key={recipient.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-heartmail-pink rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{recipient.name}</CardTitle>
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
                {recipient.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{recipient.phone}</span>
                  </div>
                )}
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
    </div>
  )
}