'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mail, Heart, Send, Loader2, X, User, MessageSquare } from 'lucide-react'
import { useAuth } from '@/lib/auth-context-new'
import { supabase } from '@/lib/supabase'
import { getFullName } from '@/lib/recipients'
import { replaceTemplateVariables, RecipientData } from '@/lib/template-variables'
import { canSendEmail, getUserUsage, getUserLimits, hasPremiumTemplateAccess } from '@/lib/subscription-client'
import UpgradeModal from '@/components/billing/upgrade-modal'

interface SendEmailModalProps {
  isOpen: boolean
  onClose: () => void
  onEmailSent?: () => void // Callback to refresh dashboard
}

interface Recipient {
  id: string
  first_name: string
  last_name?: string
  name?: string // Keep for backward compatibility
  email: string
  relationship?: string
  custom_variables?: Record<string, string>
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Template {
  id: string
  title: string
  content: string
}

export default function SendEmailModal({ isOpen, onClose, onEmailSent }: SendEmailModalProps) {
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
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false)
  const [pendingTemplateId, setPendingTemplateId] = useState<string>('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeModalType, setUpgradeModalType] = useState<'emails' | 'recipients' | 'templates' | 'scheduling'>('emails')
  const [currentUsage, setCurrentUsage] = useState(0)
  const [currentLimit, setCurrentLimit] = useState(0)
  const { user } = useAuth()

  // Fetch recipients and templates when modal opens
  useEffect(() => {
    if (isOpen && user) {
      fetchRecipients()
      fetchTemplates()
    }
    
    // Reset success state when modal closes
    if (!isOpen) {
      setIsSuccess(false)
    }
  }, [isOpen, user])

  const fetchRecipients = async () => {
    if (!user) return
    
    setRecipientsLoading(true)
    try {
      const { data, error } = await supabase
        .from('recipients')
        .select('id, first_name, last_name, name, email, relationship, custom_variables, is_active, created_at, updated_at')
        .eq('user_id', user.id)
        .order('first_name')

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

  const fetchTemplates = async () => {
    if (!user) return
    
    setTemplatesLoading(true)
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('id, title, content, is_premium')
        .eq('user_id', user.id)
        .order('title')

      if (error) {
        console.error('Error fetching templates:', error)
      } else {
        // Check if user has premium template access
        const hasPremiumAccess = await hasPremiumTemplateAccess(user.id)
        
        // Filter out premium templates if user doesn't have access
        const filteredTemplates = (data || []).filter(template => {
          if (template.is_premium && !hasPremiumAccess) {
            return false // Hide premium templates for free users
          }
          return true
        })
        
        setTemplates(filteredTemplates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleRecipientSelect = (recipientId: string) => {
    setSelectedRecipientId(recipientId)
    const recipient = recipients.find(r => r.id === recipientId)
    if (recipient) {
      setFormData(prev => ({ ...prev, to: recipient.email }))
      
      // If a template is already selected, apply variable replacement
      if (selectedTemplateId) {
        const template = templates.find(t => t.id === selectedTemplateId)
        if (template) {
          const recipientData: RecipientData = {
            first_name: recipient.first_name,
            last_name: recipient.last_name || '',
            email: recipient.email,
            relationship: recipient.relationship,
            custom_variables: recipient.custom_variables
          }
          
          const processedContent = replaceTemplateVariables(template.content, recipientData)
          const processedTitle = replaceTemplateVariables(template.title, recipientData)
          
          setFormData(prev => ({ 
            ...prev, 
            subject: processedTitle,
            message: processedContent
          }))
        }
      }
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    // Check if there's existing content in the message field
    if (formData.message.trim() !== '') {
      setPendingTemplateId(templateId)
      setShowTemplateConfirm(true)
      return
    }
    
    // If no existing content, apply template directly
    applyTemplate(templateId)
  }

  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find(t => t.id === templateId)
    const recipient = recipients.find(r => r.id === selectedRecipientId)
    
    if (template) {
      let processedContent = template.content
      let processedTitle = template.title
      
      // If a recipient is selected, replace variables
      if (recipient) {
        const recipientData: RecipientData = {
          first_name: recipient.first_name,
          last_name: recipient.last_name || '',
          email: recipient.email,
          relationship: recipient.relationship,
          custom_variables: recipient.custom_variables
        }
        
        processedContent = replaceTemplateVariables(template.content, recipientData)
        processedTitle = replaceTemplateVariables(template.title, recipientData)
      }
      
      setFormData(prev => ({ 
        ...prev, 
        subject: processedTitle,
        message: processedContent
      }))
    }
    setShowTemplateConfirm(false)
    setPendingTemplateId('')
  }

  const cancelTemplateSelection = () => {
    setShowTemplateConfirm(false)
    setPendingTemplateId('')
    // Reset the select to show no selection
    setSelectedTemplateId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('You must be logged in to send emails')
      return
    }

    // Check if user can send emails
    const canSend = await canSendEmail(user.id)
    if (!canSend) {
      // Get current usage and limits
      const [usage, limits] = await Promise.all([
        getUserUsage(user.id),
        getUserLimits(user.id)
      ])
      
      setCurrentUsage(usage?.emails_sent_this_month || 0)
      setCurrentLimit(limits.emails_per_month || 0)
      setUpgradeModalType('emails')
      setShowUpgradeModal(true)
      return
    }

    setIsLoading(true)

    console.log('📧 Frontend: Starting email send...', {
      to: formData.to,
      subject: formData.subject,
      message: formData.message?.substring(0, 50) + '...',
      from: user?.email || 'heartmailio@gmail.com'
    });

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
          from: user?.email || 'heartmailio@gmail.com',
          userId: user?.id
        })
      })

      console.log('📧 Frontend: Response status:', response.status);

      if (response.ok) {
        setIsSuccess(true)
        // Reset form after success
        setFormData({ to: '', subject: '', message: '' })
        setSelectedRecipientId('')
        setSelectedTemplateId('')
        
        // Wait a moment for database to commit, then trigger refreshes
        setTimeout(() => {
          // Trigger dashboard refresh
          if (onEmailSent) {
            onEmailSent()
          }
          
          // Trigger global email sent event for billing refresh
          window.dispatchEvent(new CustomEvent('emailSent'))
          
          // Force a page refresh for all components
          window.dispatchEvent(new CustomEvent('refreshDashboard'))
        }, 200)
        
        // Don't auto-close the success modal - let user close it manually
        // setTimeout(() => {
        //   setIsSuccess(false)
        //   onClose()
        // }, 2000)
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
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby="send-email-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Heart className="h-6 w-6 text-heartmail-pink" />
            <span>Send a Heartfelt Email</span>
          </DialogTitle>
        </DialogHeader>
        <div id="send-email-description" className="sr-only">
          Send a heartfelt email to your loved ones using templates and personal messages.
        </div>

        {isSuccess ? (
          <div className="text-center py-12 px-6">
            {/* Animated Heart Icon */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-heartmail-pink to-pink-600 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-xl">
              <Heart className="h-12 w-12 text-white fill-white" />
            </div>
            
            {/* Success Message */}
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Email Sent Successfully! 💕
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Your heartfelt message has been delivered with love. They're going to smile when they see it! ❤️
            </p>
            
            {/* Close Button */}
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  setIsSuccess(false)
                  onClose()
                }}
                className="px-8 py-4 text-lg bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 rounded-xl"
              >
                <Heart className="h-5 w-5 mr-2" />
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Template (Optional)</span>
                </CardTitle>
                <CardDescription>
                  Start from a template or write from scratch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {templatesLoading ? (
                  <p className="text-sm text-gray-500">Loading templates...</p>
                ) : (
                  <Select onValueChange={handleTemplateSelect} value={selectedTemplateId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.length === 0 ? (
                        <SelectItem value="no-templates" disabled>
                          No templates found. Create some in the Templates tab!
                        </SelectItem>
                      ) : (
                        templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>

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
                            {getFullName(recipient)} ({recipient.email})
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

      {/* Template Confirmation Popup */}
      <Dialog open={showTemplateConfirm} onOpenChange={setShowTemplateConfirm}>
        <DialogContent 
          className="sm:max-w-md"
          aria-describedby="template-confirm-description"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Overwrite Existing Message?
            </DialogTitle>
          </DialogHeader>
          <div id="template-confirm-description" className="sr-only">
            Confirm using the selected template for your email.
          </div>
          <div className="space-y-4">
            <p className="text-gray-600">
              You have existing content in your message. Applying this template will overwrite your current work.
            </p>
            <p className="text-sm text-gray-500">
              Do you want to continue and replace your message with the template?
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={cancelTemplateSelection}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => applyTemplate(pendingTemplateId)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
              >
                Apply Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType={upgradeModalType}
        currentUsage={currentUsage}
        currentLimit={currentLimit}
      />
    </Dialog>
  )
}
