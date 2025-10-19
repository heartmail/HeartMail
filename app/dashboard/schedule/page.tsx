'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Mail, Clock, Calendar, Users, Filter, X, MessageSquare, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  name: string
  subject: string
  content: string
}

export default function SchedulePage() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(currentMonth)
  const [currentYearState, setCurrentYearState] = useState(currentYear)
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDayModal, setShowDayModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<{ date: string; emails: any[] } | null>(null)
  
  // New state for real data
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [scheduledEmails, setScheduledEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Fetch recipients and templates from database
  useEffect(() => {
    if (user) {
      fetchRecipients()
      fetchTemplates()
      fetchScheduledEmails()
    }
  }, [user])

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
        .select('id, name, subject, content')
        .eq('user_id', user.id)
        .order('name')

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
        .select('*')
        .eq('user_id', user.id)
        .order('send_at')

      if (error) {
        console.error('Error fetching scheduled emails:', error)
      } else {
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
    // Return scheduled emails for the specific date
    return scheduledEmails.filter(email => {
      const emailDate = new Date(email.send_at).toISOString().split('T')[0]
      return emailDate === date
    }).map(email => ({
      id: email.id,
      title: email.subject,
      type: 'scheduled',
      recipient: email.to_email,
      time: new Date(email.send_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(email.send_at).toISOString().split('T')[0],
      status: email.status
    }))
  }

  const getEmailsForMonth = () => {
    // Return all scheduled emails for the current month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return scheduledEmails.filter(email => {
      const emailDate = new Date(email.send_at)
      return emailDate.getMonth() === currentMonth && emailDate.getFullYear() === currentYear
    }).map(email => {
      const emailDate = new Date(email.send_at)
      return {
        id: email.id,
        title: email.subject,
        type: 'scheduled',
        recipient: email.to_email,
        time: emailDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: emailDate.toISOString().split('T')[0],
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
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const frequency = formData.get('frequency') as string
    const personalMessage = formData.get('personalMessage') as string

    if (!recipientId || !date || !time) {
      alert('Please fill in all required fields')
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

      // Create the scheduled email
      const sendAt = new Date(`${date}T${time}`)
      
      const { data, error } = await supabase
        .from('scheduled_emails')
        .insert({
          user_id: user.id,
          recipient_id: recipientId,
          template_id: templateId,
          subject: template?.subject || 'Heartfelt Message',
          body_html: template?.content || personalMessage,
          send_at: sendAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error scheduling email:', error)
        alert('Failed to schedule email. Please try again.')
      } else {
        // Trigger Inngest event to schedule the email
        try {
          const response = await fetch('/api/schedule-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              scheduledEmailId: data.id,
              userId: user.id,
              sendAt: sendAt.toISOString()
            })
          })

          if (response.ok) {
            alert('Email scheduled successfully!')
            setShowAddModal(false)
            // Refresh the data
            fetchRecipients()
            fetchTemplates()
            fetchScheduledEmails()
          } else {
            console.error('Failed to trigger Inngest event')
            alert('Email saved but scheduling may not work. Please check your Inngest configuration.')
          }
        } catch (error) {
          console.error('Error triggering Inngest event:', error)
          alert('Email saved but scheduling may not work. Please check your Inngest configuration.')
        }
      }
    } catch (error) {
      console.error('Error scheduling email:', error)
      alert('Failed to schedule email. Please try again.')
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
            {/* Upcoming Emails List */}
            <div className="upcoming-emails">
              <h3>Upcoming Scheduled Emails</h3>
              <div className="emails-list">
                {getEmailsForMonth().map((email) => (
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
                      <button className="action-btn edit-btn">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="action-btn delete-btn">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Schedule Button */}
        <div className="add-schedule-fab">
          <Button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-5 w-5" />
            Schedule Email
          </Button>
        </div>

        {/* Add Schedule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-gradient-to-r from-heartmail-pink to-pink-500 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Schedule a Heartfelt Email</h3>
                      <p className="text-pink-100">Send love at the perfect time</p>
                    </div>
                  </div>
                  <button 
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                    onClick={() => setShowAddModal(false)}
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
                    <label className="text-lg font-semibold text-gray-800">Who are you sending love to?</label>
                  </div>
                  <select name="recipient" className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-heartmail-pink focus:border-transparent" required>
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
                    <label className="text-lg font-semibold text-gray-800">Choose a template (optional)</label>
                  </div>
                  <select name="template" className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="">Start from scratch or use a template...</option>
                    {loading ? (
                      <option disabled>Loading templates...</option>
                    ) : templates.length === 0 ? (
                      <option disabled>No templates found. Create some in the Templates tab!</option>
                    ) : (
                      templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Subject Card */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <label className="text-lg font-semibold text-gray-800">What's this email about?</label>
                  </div>
                  <input 
                    name="subject"
                    type="text"
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
                    <label className="text-lg font-semibold text-gray-800">Share your heart with them</label>
                  </div>
                  <textarea 
                    name="personalMessage"
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
                    onClick={() => setShowAddModal(false)}
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
    </div>
  )
}
