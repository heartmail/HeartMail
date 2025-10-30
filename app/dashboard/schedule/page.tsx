'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Mail, Clock, Calendar, Users, Filter, X, MessageSquare, Heart, Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context-new'
import { supabase } from '@/lib/supabase'
import { getFullName } from '@/lib/recipients'
import { replaceTemplateVariables, hasTemplateVariables, RecipientData, hasUnreplacedVariables, getUnreplacedVariables } from '@/lib/template-variables'
import { hasPremiumTemplateAccess, canScheduleEmails } from '@/lib/subscription-client'
import { getUserTimezone } from '@/lib/timezone'
import { getUserProfile } from '@/lib/profile'
import VariableValidationModal from '@/components/email/variable-validation-modal'
// DashboardLayout is already applied through the main layout

const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentYear = currentDate.getFullYear()

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const scheduledEmails = [
  {
    id: 1,
    title: 'Weekly Check-in',
    recipient: 'Grandma Rose',
    date: '2024-01-15',
    time: '10:00 AM',
    type: 'weekly',
    status: 'scheduled'
  },
  {
    id: 2,
    title: 'Family Photos',
    recipient: 'Grandpa John',
    date: '2024-01-18',
    time: '2:00 PM',
    type: 'monthly',
    status: 'scheduled'
  },
  {
    id: 3,
    title: 'Thinking of You',
    recipient: 'Aunt Mary',
    date: '2024-01-20',
    time: '3:30 PM',
    type: 'one-time',
    status: 'pending'
  },
  {
    id: 4,
    title: 'Birthday Wishes',
    recipient: 'Uncle Bob',
    date: '2024-01-25',
    time: '9:00 AM',
    type: 'special',
    status: 'scheduled'
  }
]

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

export default function SchedulePage() {
  const searchParams = useSearchParams()
  const [currentMonthIndex, setCurrentMonthIndex] = useState(currentMonth)
  const [currentYearState, setCurrentYearState] = useState(currentYear)
  const [viewMode, setViewMode] = useState(searchParams.get('view') === 'list' ? 'list' : 'calendar') // 'calendar' or 'list'
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDayModal, setShowDayModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<{ date: string; emails: any[] } | null>(null)
  
  // New state for real data
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [scheduledEmails, setScheduledEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('')
  const [formData, setFormData] = useState({
    subject: '',
    personalMessage: ''
  })
  const [showTemplatePreview, setShowTemplatePreview] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingEmail, setViewingEmail] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredScheduledEmails, setFilteredScheduledEmails] = useState<any[]>([])
  
  // Template variable replacement states
  const [showVariableReplacementModal, setShowVariableReplacementModal] = useState(false)
  const [showTemplateSwitchModal, setShowTemplateSwitchModal] = useState(false)
  const [pendingTemplateId, setPendingTemplateId] = useState<string>('')
  const [pendingRecipientId, setPendingRecipientId] = useState<string>('')
  const [emailPreview, setEmailPreview] = useState<string>('')
  
  // Variable validation states
  const [showVariableValidation, setShowVariableValidation] = useState(false)
  const [unreplacedVariables, setUnreplacedVariables] = useState<string[]>([])
  const [pendingEmailContent, setPendingEmailContent] = useState<string>('')
  
  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  
  // Timezone state
  const [userTimezone, setUserTimezone] = useState<string>(getUserTimezone())
  
  const { user } = useAuth()

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time24: string): string => {
    if (!time24) return ''
    
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    
    return `${hour12}:${minutes} ${ampm}`
  }

  // Fetch user's timezone preference from profile
  useEffect(() => {
    if (user) {
      getUserProfile(user.id).then(profile => {
        if (profile?.timezone) {
          setUserTimezone(profile.timezone)
        }
      }).catch(err => {
        console.error('Error fetching user profile for timezone:', err)
        // Fall back to browser timezone
      })
    }
  }, [user])

  // Fetch recipients and templates from database
  useEffect(() => {
    if (user) {
      fetchRecipients()
      fetchTemplates()
      fetchScheduledEmails()
    }
  }, [user])

  // Filter scheduled emails based on search query (only for list view)
  useEffect(() => {
    if (viewMode === 'list') {
      if (!searchQuery.trim()) {
        setFilteredScheduledEmails(scheduledEmails)
      } else {
        const filtered = scheduledEmails.filter(email => {
          const searchLower = searchQuery.toLowerCase()
          
          // Search by text content
          const textMatch = email.title?.toLowerCase().includes(searchLower) ||
            email.content?.toLowerCase().includes(searchLower) ||
            email.recipients?.first_name?.toLowerCase().includes(searchLower) ||
            email.recipients?.last_name?.toLowerCase().includes(searchLower) ||
            email.recipients?.email?.toLowerCase().includes(searchLower)
          
          // Search by status
          const statusMatch = email.status?.toLowerCase().includes(searchLower)
          
          // Search by frequency
          const frequencyMatch = email.frequency?.toLowerCase().includes(searchLower)
          
          return textMatch || statusMatch || frequencyMatch
        })
        setFilteredScheduledEmails(filtered)
      }
    }
  }, [scheduledEmails, searchQuery, viewMode])

  const fetchRecipients = async () => {
    if (!user) return
    
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
    }
  }

  const fetchTemplates = async () => {
    if (!user) return
    
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
      setLoading(false)
    }
  }

  const fetchScheduledEmails = async () => {
    if (!user) return
    
    try {
      // Fetch scheduled emails first
      const { data: emails, error: emailsError } = await supabase
        .from('scheduled_emails')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date')

      if (emailsError) {
        console.error('Error fetching scheduled emails:', emailsError)
        return
      }

      if (!emails || emails.length === 0) {
        setScheduledEmails([])
        return
      }

      // Get unique recipient IDs
      const recipientIds = Array.from(new Set(emails.map(e => e.recipient_id).filter(Boolean)))

      // Fetch recipients separately to avoid relationship ambiguity
      const { data: recipients, error: recipientsError } = await supabase
        .from('recipients')
        .select('id, first_name, last_name, email')
        .in('id', recipientIds)

      if (recipientsError) {
        console.error('Error fetching recipients:', recipientsError)
        setScheduledEmails(emails) // Still show emails even if recipient fetch fails
        return
      }

      // Create a map for quick lookup
      const recipientMap = new Map(recipients?.map(r => [r.id, r]) || [])

      // Combine emails with recipient data
      const emailsWithRecipients = emails.map(email => ({
        ...email,
        recipients: recipientMap.get(email.recipient_id) || null
      }))

      console.log('Fetched scheduled emails:', emailsWithRecipients)
      setScheduledEmails(emailsWithRecipients)
    } catch (error) {
      console.error('Error fetching scheduled emails:', error)
    }
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getEmailsForDate = (date: string) => {
    const targetDate = new Date(date)
    const emails = scheduledEmails.filter(email => {
      const emailDate = new Date(email.scheduled_date)
      
      // Direct date match
      if (email.scheduled_date === date) {
        return true
      }
      
      // Handle recurring emails
      if (email.frequency && email.frequency !== 'one-time') {
        const originalDate = new Date(email.scheduled_date)
        const timeDiff = targetDate.getTime() - originalDate.getTime()
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        
        switch (email.frequency) {
          case 'daily':
            return daysDiff >= 0 && daysDiff % 1 === 0
          case 'weekly':
            return daysDiff >= 0 && daysDiff % 7 === 0
          case 'monthly':
            return targetDate.getDate() === originalDate.getDate() && 
                   targetDate >= originalDate
          default:
            return false
        }
      }
      
      return false
    }).map(email => {
      // Use frequency for email type instead of title parsing
      let emailType = email.frequency || 'one-time'
      
      // Override for special occasions
      if (email.title?.toLowerCase().includes('birthday')) {
        emailType = 'special'
      } else if (email.title?.toLowerCase().includes('family') || email.title?.toLowerCase().includes('gang')) {
        emailType = 'special'
      }
      
      return {
        id: email.id,
        title: email.title,
        type: emailType,
        recipient: email.recipient_id,
        time: email.scheduled_time || '12:00',
        date: email.scheduled_date,
        status: email.status,
        frequency: email.frequency
      }
    })
    
    // Debug logging
    if (emails.length > 0) {
      console.log(`Found ${emails.length} emails for date ${date}:`, emails)
    }
    
    return emails
  }

  const getEmailsForMonth = () => {
    // Return all scheduled emails for the current month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return scheduledEmails.filter(email => {
      if (!email.scheduled_date) return false
      const emailDate = new Date(email.scheduled_date)
      return emailDate.getMonth() === currentMonth && emailDate.getFullYear() === currentYear
    }).map(email => {
      const emailDate = new Date(email.scheduled_date)
      return {
        id: email.id,
        title: email.title,
        type: 'scheduled',
        recipient: email.recipient_id, // We'll need to fetch recipient name separately
        time: email.scheduled_time || '12:00',
        date: email.scheduled_date,
        status: email.status
      }
    })
  }

  const handleScheduleEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || isSubmitting) return

    setIsSubmitting(true)

    // Check if user can schedule emails
    const canSchedule = await canScheduleEmails(user.id)
    if (!canSchedule) {
      alert('Email scheduling is only available with Family and Extended plans. Please upgrade to schedule emails.')
      setIsSubmitting(false)
      return
    }

    // Safely get form data
    let formData: FormData
    try {
      // Try to get form element from event target
      let formElement = e.currentTarget
      
      // If currentTarget is not a form, try to find the form element
      if (!formElement || !(formElement instanceof HTMLFormElement)) {
        formElement = e.currentTarget?.closest('form') as HTMLFormElement
      }
      
      // If still not found, try to find by data attribute
      if (!formElement || !(formElement instanceof HTMLFormElement)) {
        formElement = document.querySelector('form[data-schedule-form]') as HTMLFormElement
      }
      
      if (formElement && formElement instanceof HTMLFormElement) {
        formData = new FormData(formElement)
      } else {
        console.error('Form element not found or invalid:', e.currentTarget)
        alert('Form submission error. Please refresh the page and try again.')
        return
      }
    } catch (error) {
      console.error('Error creating FormData:', error)
      alert('Form submission error. Please refresh the page and try again.')
      return
    }

    const recipientId = formData.get('recipient') as string
    const templateId = formData.get('template') as string
    const subject = formData.get('subject') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const frequency = formData.get('frequency') as string
    const personalMessage = formData.get('personalMessage') as string

    if (!recipientId || !subject || !date || !time) {
      alert('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }
    
    // Validate that the scheduled time is at least 2 minutes in the future
    // Create date in user's local timezone for validation
    const scheduledDateTime = `${date}T${time}:00`
    const now = new Date()
    const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000)

    // Parse the scheduled time as local time for comparison
    const scheduledLocalTime = new Date(scheduledDateTime)
    
    if (scheduledLocalTime <= twoMinutesFromNow) {
      alert('Please schedule the email for at least 2 minutes in the future')
      setIsSubmitting(false)
      return
    }

    // Check for unreplaced variables in the email content
    const template = templates.find(t => t.id === templateId)
    const emailContent = template?.content || personalMessage
    if (hasUnreplacedVariables(emailContent)) {
      const unreplacedVars = getUnreplacedVariables(emailContent)
      setUnreplacedVariables(unreplacedVars)
      setPendingEmailContent(emailContent)
      setShowVariableValidation(true)
      setIsSubmitting(false)
      return
    }

    try {
      // Find the selected recipient and template
      const recipient = recipients.find(r => r.id === recipientId)
      const template = templates.find(t => t.id === templateId)

      if (!recipient) {
        alert('Please select a valid recipient')
        setIsSubmitting(false)
        return
      }
      
      // Use the proper API endpoint for scheduling emails
      try {
        const response = await fetch('/api/schedule-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            recipientId: recipientId,
            templateId: templateId,
            toEmail: recipient.email,
            toName: `${recipient.first_name} ${recipient.last_name || ''}`.trim(),
            subject: subject || template?.title || 'Heartfelt Message',
            bodyHtml: template?.content || personalMessage,
            bodyText: personalMessage,
            scheduledDate: date,
            scheduledTime: time,
            frequency: frequency || 'one-time',
            userTimezone: userTimezone
          })
        })

        if (response.ok) {
          const result = await response.json()
          setShowSuccessModal(true)
          handleCloseModal()
          // Refresh the data
          fetchRecipients()
          fetchTemplates()
          fetchScheduledEmails()
          // Notify other components that an email was scheduled
          window.dispatchEvent(new CustomEvent('emailScheduled'))
          setIsSubmitting(false)
        } else {
          const errorData = await response.json()
          console.error('Failed to schedule email:', errorData)
          alert(`Failed to schedule email: ${errorData.error || 'Unknown error'}`)
          setIsSubmitting(false)
        }
      } catch (error) {
        console.error('Error scheduling email:', error)
        alert('Failed to schedule email. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error scheduling email:', error)
      alert('Failed to schedule email. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    // Handle "Start from scratch" option
    if (templateId === '') {
      setSelectedTemplateId('')
      setFormData(prev => ({
        ...prev,
        subject: '',
        personalMessage: ''
      }))
      return
    }
    
    // Check if there's existing content in the message or subject fields
    if (formData.personalMessage.trim() !== '' || formData.subject.trim() !== '') {
      setPendingTemplateId(templateId)
      setShowTemplateSwitchModal(true)
      return
    }
    
    // If no existing content, apply template directly
    applyTemplate(templateId)
  }

  const handleRecipientSelect = (recipientId: string) => {
    setSelectedRecipientId(recipientId)
    
    // If a template is already selected, show variable replacement modal
    if (selectedTemplateId && recipientId) {
      const template = templates.find(t => t.id === selectedTemplateId)
      if (template && hasTemplateVariables(template.content)) {
        setPendingRecipientId(recipientId)
        setShowVariableReplacementModal(true)
      }
    }
  }

  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        subject: template.title,
        personalMessage: template.content
      }))
    }
    setShowTemplateConfirm(false)
    setPendingTemplateId('')
  }

  const applyTemplateWithVariables = (templateId: string, recipientId: string) => {
    setSelectedTemplateId(templateId)
    setSelectedRecipientId(recipientId)
    
    const template = templates.find(t => t.id === templateId)
    const recipient = recipients.find(r => r.id === recipientId)
    
    if (template && recipient) {
      // Replace variables in template content
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
        personalMessage: processedContent
      }))
      
      // Set preview for user to see
      setEmailPreview(processedContent)
    }
  }

  const handleVariableValidationConfirm = async () => {
    setShowVariableValidation(false)
    
    // Proceed with scheduling the email
    try {
      // Find the form element more reliably
      let formElement = document.querySelector('form[data-schedule-form]') as HTMLFormElement
      
      // If not found by data attribute, try to find any form in the modal
      if (!formElement) {
        formElement = document.querySelector('.fixed.inset-0 form') as HTMLFormElement
      }
      
      // If still not found, try to find the most recent form
      if (!formElement) {
        const forms = document.querySelectorAll('form')
        formElement = forms[forms.length - 1] as HTMLFormElement
      }
      
      if (!formElement || !(formElement instanceof HTMLFormElement)) {
        console.error('Schedule form not found - checking all forms:', document.querySelectorAll('form'))
        alert('Form not found. Please refresh the page and try again.')
        return
      }
      
      const formData = new FormData(formElement)
      const recipientId = formData.get('recipient') as string
      const templateId = formData.get('template') as string
      const subject = formData.get('subject') as string
      const date = formData.get('date') as string
      const time = formData.get('time') as string
      const frequency = formData.get('frequency') as string
      const personalMessage = formData.get('personalMessage') as string

      const recipient = recipients.find(r => r.id === recipientId)
      const template = templates.find(t => t.id === templateId)

      if (!recipient) {
        alert('Please select a valid recipient')
        return
      }
      
      // Use the proper API endpoint for scheduling emails
      const response = await fetch('/api/schedule-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          recipientId: recipientId,
          templateId: templateId,
          toEmail: recipient.email,
          toName: `${recipient.first_name} ${recipient.last_name || ''}`.trim(),
          subject: subject || template?.title || 'Heartfelt Message',
          bodyHtml: template?.content || personalMessage,
          bodyText: personalMessage,
          sendAt: new Date(`${date}T${time}`).toISOString(),
          frequency: frequency || 'one-time',
          userTimezone: getUserTimezone()
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert('Email scheduled successfully!')
        handleCloseModal()
        // Refresh the data
        fetchRecipients()
        fetchTemplates()
        fetchScheduledEmails()
      } else {
        const errorData = await response.json()
        console.error('Failed to schedule email:', errorData)
        alert(`Failed to schedule email: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error scheduling email:', error)
      alert('Failed to schedule email. Please try again.')
    }
  }

  const cancelTemplateSelection = () => {
    setShowTemplateConfirm(false)
    setPendingTemplateId('')
    // Reset the select to show no selection
    setSelectedTemplateId('')
  }

  const handleTemplatePreview = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setPreviewTemplate(template)
      setShowTemplatePreview(true)
    }
  }


  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setSelectedTemplateId('')
    setSelectedRecipientId('')
    setFormData({
      subject: '',
      personalMessage: ''
    })
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    resetForm()
  }

  const handleDeleteScheduledEmail = async (emailId: string) => {
    // Show confirmation modal instead of native confirm
    setEmailToDelete(emailId)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!emailToDelete) return

    setShowDeleteConfirm(false)

    try {
      const response = await fetch('/api/delete-scheduled-email', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailId: emailToDelete })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Close any open modals
        setShowViewModal(false)
        setShowDayModal(false)
        setViewingEmail(null)
        setEmailToDelete(null)
        
        // Show success modal instead of native alert
        setShowDeleteSuccess(true)
        
        // Refresh the data
        fetchScheduledEmails()
        
        // Dispatch event to update dashboard counters
        window.dispatchEvent(new CustomEvent('emailScheduled'))
        window.dispatchEvent(new CustomEvent('refreshDashboard'))
      } else {
        const errorData = await response.json()
        console.error('Failed to delete scheduled email:', errorData)
        alert(`Failed to delete scheduled email: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting scheduled email:', error)
      alert('Failed to delete scheduled email. Please try again.')
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setEmailToDelete(null)
  }

  const handleViewEmail = async (emailId: string) => {
    try {
      // Fetch the scheduled email first
      const { data: email, error: emailError } = await supabase
        .from('scheduled_emails')
        .select('*')
        .eq('id', emailId)
        .single()

      if (emailError) {
        console.error('Error fetching email:', emailError)
        alert('Failed to load email details')
        return
      }

      // Fetch recipient separately to avoid relationship ambiguity
      let recipientData = null
      if (email.recipient_id) {
        const { data: recipient, error: recipientError } = await supabase
          .from('recipients')
          .select('first_name, last_name, email')
          .eq('id', email.recipient_id)
          .single()

        if (!recipientError && recipient) {
          recipientData = recipient
        }
      }

      // Fetch template if template_id exists
      let templateData = null
      if (email.template_id) {
        const { data: template, error: templateError } = await supabase
          .from('templates')
          .select('title, content')
          .eq('id', email.template_id)
          .single()

        if (!templateError && template) {
          templateData = template
        }
      }

      // Combine the data
      const emailWithDetails = {
        ...email,
        recipients: recipientData,
        templates: templateData
      }

      // Close the day modal if it's open
      setShowDayModal(false)
      
      setViewingEmail(emailWithDetails)
      setShowViewModal(true)
    } catch (error) {
      console.error('Error viewing email:', error)
      alert('Failed to load email details')
    }
  }

  const handleDayClick = (date: string) => {
    const emails = getEmailsForDate(date)
    setSelectedDay({ date, emails })
    setShowDayModal(true)
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonthIndex, currentYearState)
    const firstDay = getFirstDayOfMonth(currentMonthIndex, currentYearState)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYearState}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const emailsForDay = getEmailsForDate(dateString)
      const isToday = day === currentDate.getDate() && currentMonthIndex === currentMonth && currentYearState === currentYear

      days.push(
        <div 
          key={day} 
          className={`calendar-day ${isToday ? 'today' : ''} ${emailsForDay.length > 0 ? 'has-events' : ''}`}
          onClick={() => handleDayClick(dateString)}
          style={{ cursor: 'pointer' }}
        >
          <div className="day-number">{day}</div>
          {emailsForDay.length > 0 && (
            <div className="day-events">
              {emailsForDay.slice(0, 2).map((email, index) => (
                <div key={index} className={`event-dot ${email.type}`} title={email.title}></div>
              ))}
              {emailsForDay.length > 2 && (
                <div className="more-events">+{emailsForDay.length - 2}</div>
              )}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonthIndex === 0) {
        setCurrentMonthIndex(11)
        setCurrentYearState(currentYearState - 1)
      } else {
        setCurrentMonthIndex(currentMonthIndex - 1)
      }
    } else {
      if (currentMonthIndex === 11) {
        setCurrentMonthIndex(0)
        setCurrentYearState(currentYearState + 1)
      } else {
        setCurrentMonthIndex(currentMonthIndex + 1)
      }
    }
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
            <p className="text-gray-600 mt-1">Manage your scheduled emails and calendar</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                onClick={() => setViewMode('calendar')}
                size="sm"
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                size="sm"
              >
                <Mail className="h-4 w-4" />
                List
              </Button>
            </div>
            <Button 
              className="btn-heartmail"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4" />
              Schedule Email
            </Button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="calendar-view">
            {/* Calendar Header */}
            <div className="calendar-header">
              <div className="calendar-navigation">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="calendar-title text-gray-900 dark:text-white font-semibold">
                  {monthNames[currentMonthIndex]} {currentYearState}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {dayNames.map(day => (
                  <div key={day} className="weekday text-gray-700 dark:text-white font-medium">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {renderCalendar()}
              </div>
            </div>

            {/* Legend */}
            <div className="calendar-legend">
              <h4 className="text-gray-900 dark:text-white font-semibold">Legend:</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-dot weekly"></div>
                  <span className="text-gray-700 dark:text-white font-medium">Weekly</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot monthly"></div>
                  <span className="text-gray-700 dark:text-white font-medium">Monthly</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot one-time"></div>
                  <span className="text-gray-700 dark:text-white font-medium">One-time</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot special"></div>
                  <span className="text-gray-700 dark:text-white font-medium">Special</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="list-view">
            {/* Search Bar - Only show in list view */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by title, recipient, status (sent/scheduled), or frequency (daily/weekly/monthly)..."
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

            {/* Upcoming Emails List */}
            <div className="upcoming-emails">
              <h3>Upcoming Scheduled Emails</h3>
              <div className="emails-list">
                {filteredScheduledEmails.map((email) => {
                  const recipientName = email.recipients 
                    ? `${email.recipients.first_name} ${email.recipients.last_name || ''}`.trim() 
                    : email.recipients?.email || 'Unknown'
                  
                  return (
                    <div key={email.id} className="email-item">
                      <div className="email-time">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div className="email-date">{new Date(email.scheduled_date).toLocaleDateString()}</div>
                          <div className="email-time-text">{formatTimeTo12Hour(email.scheduled_time)}</div>
                        </div>
                      </div>
                      <div className="email-content">
                        <div className="email-title">{email.title}</div>
                        <div className="email-recipient">to {recipientName}</div>
                      </div>
                      <div className="email-meta">
                        <span className={`email-type ${email.frequency || 'one-time'}`}>{email.frequency || 'one-time'}</span>
                        <span className={`email-status ${email.status}`}>{email.status}</span>
                      </div>
                      <div className="email-actions">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => handleViewEmail(email.id)}
                          title="View email details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {email.status !== 'sent' && (
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteScheduledEmail(email.id)}
                            title="Delete scheduled email"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}


        {/* Add Schedule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-gradient-to-r from-heartmail-pink to-pink-500 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Schedule Email</h3>
                      <p className="text-pink-100">Send love at the perfect time</p>
                    </div>
                  </div>
                  <button 
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                    onClick={handleCloseModal}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleScheduleEmail} className="p-6 space-y-6" data-schedule-form>
                {/* Template Card */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <label className="text-lg font-semibold text-gray-800">Template (optional)</label>
                  </div>
                  <div className="flex space-x-2">
                    <select 
                      name="template" 
                      value={selectedTemplateId}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      className="flex-1 p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Start from scratch or use a template...</option>
                      {loading ? (
                        <option disabled>Loading templates...</option>
                      ) : templates.length === 0 ? (
                        <option disabled>No templates found. Create some in the Templates tab!</option>
                      ) : (
                        templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.title}
                          </option>
                        ))
                      )}
                    </select>
                    {selectedTemplateId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTemplatePreview(selectedTemplateId)}
                        className="px-3 py-3 border-purple-200 hover:bg-purple-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Recipient Card */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Users className="h-5 w-5 text-heartmail-pink" />
                    <label className="text-lg font-semibold text-gray-800">Recipient</label>
                  </div>
                  <select 
                    name="recipient" 
                    value={selectedRecipientId}
                    onChange={(e) => handleRecipientSelect(e.target.value)}
                    className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-heartmail-pink focus:border-transparent" 
                    required
                  >
                    <option value="">Choose a loved one...</option>
                    {loading ? (
                      <option disabled>Loading recipients...</option>
                    ) : recipients.length === 0 ? (
                      <option disabled>No recipients found. Add some in the Recipients tab!</option>
                    ) : (
                      recipients.map((recipient) => (
                        <option key={recipient.id} value={recipient.id}>
                          {getFullName(recipient)} ({recipient.email})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Subject Card */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <label className="text-lg font-semibold text-gray-800">Subject</label>
                  </div>
                  <input 
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleFormChange('subject', e.target.value)}
                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Just wanted to say I love you..."
                    required
                  />
                </div>

                {/* Date & Time Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="h-5 w-5 text-green-600" />
                    <label className="text-lg font-semibold text-gray-800">When should this be sent?</label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input name="date" type="date" className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input name="time" type="time" className="w-full p-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
                    </div>
                  </div>
                </div>

                {/* Frequency Card */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <label className="text-lg font-semibold text-gray-800">How often?</label>
                  </div>
                  <select name="frequency" className="w-full p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="one-time">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {/* Personal Message Card */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Heart className="h-5 w-5 text-rose-600" />
                    <label className="text-lg font-semibold text-gray-800">Message</label>
                  </div>
                  <textarea 
                    name="personalMessage"
                    value={formData.personalMessage}
                    onChange={(e) => handleFormChange('personalMessage', e.target.value)}
                    className="w-full p-3 border border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    placeholder="Dear [Name],&#10;&#10;I just wanted to take a moment to tell you how much you mean to me..."
                    rows={6}
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleCloseModal}
                    className="flex-1 py-3 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 py-3 text-lg font-semibold bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    {isSubmitting ? 'Scheduling...' : 'Schedule with Love'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* Day Popup Modal */}
      {showDayModal && selectedDay && (
        <div className="modal-overlay" onClick={() => setShowDayModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <Calendar className="h-5 w-5" />
                {new Date(selectedDay.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowDayModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="modal-body">
              {selectedDay.emails.length > 0 ? (
                <div className="space-y-4">
                  {selectedDay.emails.map((email) => (
                    <div key={email.id} className="email-item">
                      <div className="email-header">
                        <div className="email-title">
                          <Mail className="h-4 w-4 text-heartmail-pink" />
                          <span className="font-semibold">{email.title}</span>
                        </div>
                        <div className={`email-status ${email.status}`}>
                          {email.status}
                        </div>
                      </div>
                      <div className="email-details">
                        <div className="email-recipient">
                          <Users className="h-4 w-4" />
                          <span>To: {email.recipient}</span>
                        </div>
                        <div className="email-time">
                          <Clock className="h-4 w-4" />
                          <span>Time: {formatTimeTo12Hour(email.time)}</span>
                        </div>
                        <div className="email-type">
                          <span className={`type-badge ${email.type}`}>
                            {email.type === 'one-time' ? 'One-time' : email.type}
                          </span>
                        </div>
                      </div>
                      <div className="email-actions">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => handleViewEmail(email.id)}
                          title="View email details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {email.status !== 'sent' && (
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteScheduledEmail(email.id)}
                            title="Delete scheduled email"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No emails scheduled for this day</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {showTemplatePreview && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTemplatePreview(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Template Preview</h3>
                    <p className="text-purple-100">{previewTemplate.title}</p>
                  </div>
                </div>
                <button 
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  onClick={() => setShowTemplatePreview(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Subject:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{previewTemplate.title}</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Content:</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-gray-700 font-sans">{previewTemplate.content}</pre>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-6">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowTemplatePreview(false)}
                  className="flex-1 py-3 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <X className="h-5 w-5 mr-2" />
                  Close
                </Button>
                <Button 
                  type="button"
                  onClick={() => {
                    handleTemplateSelect(previewTemplate.id)
                    setShowTemplatePreview(false)
                  }}
                  className="flex-1 py-3 text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Use This Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Confirmation Dialog */}
      {showTemplateConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTemplateConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Overwrite Existing Content?</h3>
                    <p className="text-pink-100">You have existing content in your message or subject</p>
                  </div>
                </div>
                <button
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  onClick={() => setShowTemplateConfirm(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  You have existing content in your message or subject fields. Applying this template will overwrite your current work.
                </p>
                <p className="text-sm text-gray-500">
                  Do you want to continue and replace your content with the template?
                </p>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelTemplateSelection}
                  className="flex-1 py-3 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => applyTemplate(pendingTemplateId)}
                  className="flex-1 py-3 text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Apply Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Variable Replacement Modal */}
      {showVariableReplacementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowVariableReplacementModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Template Variables</h3>
                    <p className="text-green-100">Variables will be replaced with recipient information</p>
                  </div>
                </div>
                <button
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  onClick={() => setShowVariableReplacementModal(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  The selected template contains variables like {'{{first_name}}'}, {'{{last_name}}'}, etc. 
                  These will be automatically replaced with the recipient's information.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Example:</strong> "Hi {'{{first_name}}'}!" becomes "Hi John!" when sent to John Smith.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowVariableReplacementModal(false)}
                  className="flex-1 py-3 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    applyTemplateWithVariables(pendingTemplateId, pendingRecipientId)
                    setShowVariableReplacementModal(false)
                  }}
                  className="flex-1 py-3 text-lg font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Apply Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Switch Confirmation Modal */}
      {showTemplateSwitchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTemplateSwitchModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Switch Template?</h3>
                    <p className="text-orange-100">This will overwrite your current content</p>
                  </div>
                </div>
                <button
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  onClick={() => setShowTemplateSwitchModal(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  You have existing content in your message or subject fields. 
                  Switching to a new template will replace your current work.
                </p>
                <p className="text-sm text-gray-500">
                  Do you want to continue and replace your content with the new template?
                </p>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTemplateSwitchModal(false)}
                  className="flex-1 py-3 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    applyTemplate(pendingTemplateId)
                    setShowTemplateSwitchModal(false)
                  }}
                  className="flex-1 py-3 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Apply Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Email Modal */}
      {showViewModal && viewingEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-red-800 via-red-700 to-rose-900 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Scheduled Email Details</h3>
                    <p className="text-red-100">View email content and details</p>
                  </div>
                </div>
                <button
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                  onClick={() => setShowViewModal(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Email Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject</label>
                  <p className="text-lg font-semibold text-gray-900">{viewingEmail.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className={`text-lg font-semibold ${viewingEmail.status === 'scheduled' ? 'text-green-600' : 'text-gray-600'}`}>
                    {viewingEmail.status}
                  </p>
                </div>
              </div>

              {/* Recipient Info */}
              <div>
                <label className="text-sm font-medium text-gray-500">Recipient</label>
                <p className="text-lg text-gray-900">
                  {viewingEmail.recipients ? 
                    `${viewingEmail.recipients.first_name} ${viewingEmail.recipients.last_name || ''}`.trim() : 
                    'Unknown'
                  }
                </p>
                <p className="text-sm text-gray-600">
                  {viewingEmail.recipients?.email || 'No email'}
                </p>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                  <p className="text-lg text-gray-900">
                    {new Date(viewingEmail.scheduled_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Scheduled Time</label>
                  <p className="text-lg text-gray-900">
                    {formatTimeTo12Hour(viewingEmail.scheduled_time)}
                  </p>
                </div>
              </div>

              {/* Email Content */}
              <div>
                <label className="text-sm font-medium text-gray-500">Email Content</label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: viewingEmail.content }}
                  />
                </div>
              </div>

              {/* Template Info */}
              {viewingEmail.templates && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Template Used</label>
                  <p className="text-lg text-gray-900">{viewingEmail.templates.title}</p>
                </div>
              )}

              {/* Personal Message */}
              {viewingEmail.personal_message && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Personal Message</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{viewingEmail.personal_message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-4 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => setShowViewModal(false)}
                className="px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowViewModal(false)
                  handleDeleteScheduledEmail(viewingEmail.id)
                }}
                disabled={viewingEmail.status === 'sent'}
                className={`px-6 ${
                  viewingEmail.status === 'sent' 
                    ? 'bg-gray-400 cursor-not-allowed opacity-50 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {viewingEmail.status === 'sent' ? 'Email Already Sent' : 'Delete Email'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Variable Validation Modal */}
      <VariableValidationModal
        isOpen={showVariableValidation}
        onClose={() => setShowVariableValidation(false)}
        onConfirm={handleVariableValidationConfirm}
        unreplacedVariables={unreplacedVariables}
        emailContent={pendingEmailContent}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in duration-300">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-rose-900 text-white p-8 text-center">
              <div className="absolute inset-0 bg-[url('/heart-pattern.svg')] opacity-10"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Delete Scheduled Email?</h3>
                <p className="text-red-100 text-sm">This action cannot be undone</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-gray-700 text-center leading-relaxed">
                  Are you sure you want to delete this scheduled email? Once deleted, this email will not be sent and cannot be recovered.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={cancelDelete}
                  variant="outline"
                  className="flex-1 py-3 text-base font-semibold border-2 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 py-3 text-base font-semibold bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in duration-300">
            {/* Animated Header */}
            <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white p-8 text-center">
              <div className="absolute inset-0 bg-[url('/heart-pattern.svg')] opacity-10"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-2">Email Deleted!</h3>
                <p className="text-green-100 text-lg">Scheduled email removed successfully</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 mb-6">
                <p className="text-sm text-gray-600 text-center">
                  ✨ The scheduled email has been permanently deleted and will not be sent.
                </p>
              </div>

              {/* Button */}
              <Button
                onClick={() => setShowDeleteSuccess(false)}
                className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in duration-300">
            {/* Animated Header */}
            <div className="relative bg-gradient-to-br from-heartmail-pink via-pink-500 to-purple-600 text-white p-8 text-center">
              <div className="absolute inset-0 bg-[url('/heart-pattern.svg')] opacity-10"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Heart className="h-10 w-10 text-white fill-current" />
                </div>
                <h3 className="text-3xl font-bold mb-2">Email Scheduled!</h3>
                <p className="text-pink-100 text-lg">Your heartfelt message is ready to send</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-semibold">Successfully Scheduled</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                  <p className="text-sm text-gray-600 text-center">
                    ✨ Your email will be sent at the scheduled time. We'll make sure your love reaches them!
                  </p>
                </div>
              </div>

              {/* Button */}
              <div className="mt-6">
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Perfect!
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
   </div>
  )
}
