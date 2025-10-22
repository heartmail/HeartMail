'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Mail, Clock, Calendar, Users, Filter, X, MessageSquare, Heart, Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { getFullName } from '@/lib/recipients'
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
  const [pendingTemplateId, setPendingTemplateId] = useState<string>('')
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingEmail, setViewingEmail] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredScheduledEmails, setFilteredScheduledEmails] = useState<any[]>([])
  const { user } = useAuth()

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
        .select('id, first_name, last_name, name, email, is_active, created_at, updated_at')
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
        .select('id, title, content')
        .eq('user_id', user.id)
        .order('title')

      if (error) {
        console.error('Error fetching templates:', error)
      } else {
        setTemplates(data || [])
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
      const { data, error } = await supabase
        .from('scheduled_emails')
        .select(`
          *,
          recipients!inner(first_name, last_name, email)
        `)
        .eq('user_id', user.id)
        .order('scheduled_date')

      if (error) {
        console.error('Error fetching scheduled emails:', error)
      } else {
        console.log('Fetched scheduled emails:', data)
        setScheduledEmails(data || [])
      }
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
    if (!user) return

    const formData = new FormData(e.currentTarget)
    const recipientId = formData.get('recipient') as string
    const templateId = formData.get('template') as string
    const subject = formData.get('subject') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const frequency = formData.get('frequency') as string
    const personalMessage = formData.get('personalMessage') as string

    if (!recipientId || !subject || !date || !time) {
      alert('Please fill in all required fields')
      return
    }

    // Validate that the scheduled time is at least 2 minutes in the future
    const sendAt = new Date(`${date}T${time}`)
    const now = new Date()
    const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000) // 2 minutes from now

    if (sendAt <= twoMinutesFromNow) {
      alert('Please schedule the email for at least 2 minutes in the future')
      return
    }

    try {
      // Find the selected recipient and template
      const recipient = recipients.find(r => r.id === recipientId)
      const template = templates.find(t => t.id === templateId)

      if (!recipient) {
        alert('Please select a valid recipient')
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
            sendAt: sendAt.toISOString(),
            frequency: frequency || 'one-time'
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
    } catch (error) {
      console.error('Error scheduling email:', error)
      alert('Failed to schedule email. Please try again.')
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    // Check if there's existing content in the message or subject fields
    if (formData.personalMessage.trim() !== '' || formData.subject.trim() !== '') {
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

  const handleRecipientSelect = (recipientId: string) => {
    setSelectedRecipientId(recipientId)
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
    if (!confirm('Are you sure you want to delete this scheduled email? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/delete-scheduled-email', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailId })
      })

      if (response.ok) {
        const result = await response.json()
        alert('Scheduled email deleted successfully!')
        // Refresh the data
        fetchScheduledEmails()
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

  const handleViewEmail = async (emailId: string) => {
    try {
      // Fetch the full email details
      const { data: email, error } = await supabase
        .from('scheduled_emails')
        .select(`
          *,
          recipients!inner(first_name, last_name, email),
          templates(title, content)
        `)
        .eq('id', emailId)
        .single()

      if (error) {
        console.error('Error fetching email:', error)
        alert('Failed to load email details')
        return
      }

      setViewingEmail(email)
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
                {filteredScheduledEmails.map((email) => (
                  <div key={email.id} className="email-item">
                    <div className="email-time">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <div className="email-date">{new Date(email.date).toLocaleDateString()}</div>
                        <div className="email-time-text">{email.time}</div>
                      </div>
                    </div>
                    <div className="email-content">
                      <div className="email-title">{email.title}</div>
                      <div className="email-recipient">to {email.recipient}</div>
                    </div>
                    <div className="email-meta">
                      <span className={`email-type ${email.type}`}>{email.type}</span>
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
                ))}
              </div>
            </div>
          </div>
        )}


        {/* Add Schedule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseModal}>
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
              <form onSubmit={handleScheduleEmail} className="p-6 space-y-6">
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
                    className="flex-1 py-3 text-lg font-semibold bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule with Love
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
                          <span>Time: {email.time}</span>
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

      {/* View Email Modal */}
      {showViewModal && viewingEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Scheduled Email Details</h3>
                    <p className="text-blue-100">View email content and details</p>
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
                    {viewingEmail.scheduled_time}
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
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
