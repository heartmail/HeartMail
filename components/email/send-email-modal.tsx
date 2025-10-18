'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Heart, Send, Loader2, X, User, MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface SendEmailModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Recipient {
  id: string
  name: string
  email: string
}

export default function SendEmailModal({ isOpen, onClose }: SendEmailModalProps) {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('')
  const [recipientsLoading, setRecipientsLoading] = useState(false)
  const { user } = useAuth()

  // Fetch recipients when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchRecipients()
    }
  }, [isOpen, user])

  const fetchRecipients = async () => {
    if (!user) return
    
    setRecipientsLoading(true)
    try {
      const { data, error } = await supabase
        .from('recipients')
        .select('id, name, email')
        .eq('user_id', user.id)
        .order('name')

      if (error) {
        console.error('Error fetching recipients:', error)
      } else {
        setRecipients(data || [])
      }
    } catch (error) {
      console.error('Error fetching recipients:', error)
    } finally {
      setRecipientsLoading(false)
    }
  }

  const handleRecipientSelect = (recipientId: string) => {
    setSelectedRecipientId(recipientId)
    const recipient = recipients.find(r => r.id === recipientId)
    if (recipient) {
      setFormData(prev => ({ ...prev, to: recipient.email }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formData.to,
          subject: formData.subject,
          message: formData.message,
          from: user?.email || 'heartmailio@gmail.com'
        })
      })

      if (response.ok) {
        setIsSuccess(true)
        // Reset form after success
        setFormData({ to: '', subject: '', message: '' })
        setSelectedRecipientId('')
        setTimeout(() => {
          setIsSuccess(false)
          onClose()
        }, 2000)
      } else {
        const errorData = await response.json()
        
        // Handle testing mode error specifically
        if (errorData.testingMode) {
          alert(`Testing Mode: ${errorData.error}\n\nFor testing, please use: ${errorData.verifiedEmail}`)
          return
        }
        
        throw new Error(errorData.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert(`Failed to send email: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Heart className="h-6 w-6 text-heartmail-pink" />
            <span>Send a Heartfelt Email</span>
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Sent! 💕</h3>
            <p className="text-gray-600">Your heartfelt message has been delivered to your loved one.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Recipient</span>
                </CardTitle>
                <CardDescription>
                  Who are you sending this love to?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recipientsLoading ? (
                  <p className="text-sm text-gray-500">Loading recipients...</p>
                ) : (
                  <Select onValueChange={handleRecipientSelect} value={selectedRecipientId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a saved recipient (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipients.length === 0 ? (
                        <SelectItem value="no-recipients" disabled>
                          No saved recipients. Add one in the Recipients tab!
                        </SelectItem>
                      ) : (
                        recipients.map(recipient => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            {recipient.name} ({recipient.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                <Input
                  type="email"
                  name="to"
                  placeholder="lovedone@example.com"
                  value={formData.to}
                  onChange={handleChange}
                  required
                  className="text-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Subject</span>
                </CardTitle>
                <CardDescription>
                  What's this email about?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  name="subject"
                  placeholder="Just wanted to say I love you..."
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="text-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Your Message</span>
                </CardTitle>
                <CardDescription>
                  Share your heart with them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  name="message"
                  placeholder="Dear [Name],&#10;&#10;I just wanted to take a moment to tell you how much you mean to me..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={8}
                  className="text-lg resize-none"
                />
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white font-semibold py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Love...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send with Love
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
