'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Mail, Clock, Calendar, Users, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export default function SchedulePage() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(currentMonth)
  const [currentYearState, setCurrentYearState] = useState(currentYear)
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDayModal, setShowDayModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<{ date: string; emails: any[] } | null>(null)

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const getEmailsForDate = (date: string) => {
    return scheduledEmails.filter(email => email.date === date)
  }

  const getEmailsForMonth = () => {
    return scheduledEmails.filter(email => {
      const emailDate = new Date(email.date)
      return emailDate.getMonth() === currentMonthIndex && emailDate.getFullYear() === currentYearState
    })
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
                <h2 className="calendar-title">
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
                  <div key={day} className="weekday">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {renderCalendar()}
              </div>
            </div>

            {/* Legend */}
            <div className="calendar-legend">
              <h4>Legend:</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="legend-dot weekly"></div>
                  <span>Weekly</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot monthly"></div>
                  <span>Monthly</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot one-time"></div>
                  <span>One-time</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot special"></div>
                  <span>Special</span>
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
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule New Email</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form className="schedule-form">
                <div className="form-group">
                  <label>Recipient</label>
                  <select className="form-select">
                    <option value="">Select recipient</option>
                    <option value="grandma-rose">Grandma Rose</option>
                    <option value="grandpa-john">Grandpa John</option>
                    <option value="aunt-mary">Aunt Mary</option>
                    <option value="uncle-bob">Uncle Bob</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Template</label>
                  <select className="form-select">
                    <option value="">Select template</option>
                    <option value="weekly-checkin">Weekly Check-in</option>
                    <option value="thinking-of-you">Thinking of You</option>
                    <option value="family-photos">Family Photos</option>
                    <option value="birthday-wishes">Birthday Wishes</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input type="time" className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Frequency</label>
                  <select className="form-select">
                    <option value="one-time">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Personal Message</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Add a personal message..."
                    rows={4}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button className="btn btn-primary">
                Schedule Email
              </Button>
            </div>
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
