'use client'

import { useState } from 'react'
import { Plus, Users, Palette, Calendar, Mail, Camera, Check, Clock, UserPlus, AlertTriangle, Bell, Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useRouter } from 'next/navigation'
import SendEmailModal from '@/components/email/send-email-modal'

const quickActions = [
  { icon: Plus, label: 'Add Recipient', href: '/dashboard/recipients' },
  { icon: Palette, label: 'Browse Templates', href: '/letter-library' },
  { icon: Calendar, label: 'Schedule Email', href: '/dashboard/schedule' },
  { icon: Camera, label: 'Upload Photos', href: '/dashboard/schedule' },
]

export default function DashboardContent() {
  const { data, loading, error } = useDashboardData()
  const router = useRouter()
  const [showEmailModal, setShowEmailModal] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-heartmail-pink mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading dashboard data</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Transform database stats into display format
  const stats = [
    { 
      label: 'Emails Sent This Month', 
      value: data.stats?.sentThisMonth?.toString() || '0', 
      icon: Mail, 
      change: data.stats?.sentThisMonth > 0 ? `+${Math.round((data.stats.sentThisMonth / 10) * 100)}% from last month` : 'No emails sent yet',
      changeType: data.stats?.sentThisMonth > 0 ? 'positive' : 'neutral'
    },
    { 
      label: 'Active Recipients', 
      value: data.stats?.activeRecipients?.toString() || '0', 
      icon: Users, 
      change: data.stats?.activeRecipients > 0 ? `${data.stats.activeRecipients} active` : 'No recipients yet',
      changeType: data.stats?.activeRecipients > 0 ? 'positive' : 'neutral'
    },
    { 
      label: 'Deliverability Rate', 
      value: `${data.stats?.deliverabilityRate || 100}%`, 
      icon: Heart, 
      change: data.stats?.deliverabilityRate >= 95 ? 'Excellent' : 'Good',
      changeType: data.stats?.deliverabilityRate >= 95 ? 'positive' : 'neutral'
    },
    { 
      label: 'Scheduled Emails', 
      value: data.stats?.scheduledEmails?.toString() || '0', 
      icon: Clock, 
      change: data.stats?.scheduledEmails > 0 ? 'Next: Tomorrow' : 'No emails scheduled',
      changeType: data.stats?.scheduledEmails > 0 ? 'positive' : 'neutral'
    },
  ]
  return (
    <div className="space-y-8 w-full max-w-full">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your HeartMail.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            className="btn-heartmail"
            onClick={() => setShowEmailModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Email
          </Button>
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </div>
        </div>
      </div>

          {/* Top Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
            <div className="dashboard-card card-hover">
              <div className="flex items-center space-x-4 p-6">
                <div className="w-12 h-12 bg-heartmail-pink rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Schedule Email</h3>
                  <p className="text-gray-600">Plan your next heartfelt message</p>
                </div>
              </div>
            </div>
            <div className="dashboard-card card-hover">
              <div className="flex items-center space-x-4 p-6">
                <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Upload Photos</h3>
                  <p className="text-gray-600">Share precious family moments</p>
                </div>
              </div>
            </div>
          </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 w-full">
            {stats.map((stat, index) => (
              <div key={index} className="dashboard-card card-hover">
                <div className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-heartmail-pink rounded-lg flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'neutral' ? 'text-gray-600' : 'text-red-600'}`}>
                    {stat.change}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

          {/* Main Dashboard Grid */}
          <div className="dashboard-grid w-full">
        {/* Recent Activity */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3>Recent Activity</h3>
                <button className="btn-text">View All</button>
              </div>
              <div className="activity-list">
                {data.recentActivity.length > 0 ? (
                  data.recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className={`activity-icon ${activity.type}`}>
                        {activity.icon === 'Check' ? <Check className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{activity.message}</div>
                        <div className="activity-time">{activity.time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>

        {/* Recipients */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Your Recipients</h3>
          </div>
          <div className="recipients-list">
            {data.recipients.length > 0 ? (
              data.recipients.map((recipient, index) => (
                <div key={recipient.id} className="recipient-item">
                  <div className="recipient-avatar">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="recipient-info">
                    <div className="recipient-name">{recipient.name}</div>
                    <div className="recipient-email">{recipient.email}</div>
                    <div className={`recipient-status ${recipient.status}`}>
                      {recipient.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="recipient-actions">
                    <button className="btn-icon">
                      <Palette className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recipients yet</p>
                <Button className="mt-4 btn-heartmail-outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Recipient
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Emails */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Upcoming Emails</h3>
          </div>
          <div className="schedule-list">
            {data.upcomingEmails.length > 0 ? (
              data.upcomingEmails.map((email, index) => (
                <div key={email.id} className="schedule-item">
                  <div className="schedule-time">
                    <div className="schedule-date">{email.date}</div>
                    <div className="schedule-hour">{email.time}</div>
                  </div>
                  <div className="schedule-content">
                    <div className="schedule-title">{email.title}</div>
                    <div className="schedule-recipient">to {email.recipient}</div>
                  </div>
                  <div className={`schedule-status ${email.status}`}>
                    {email.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming emails</p>
                <Button className="mt-4 btn-heartmail-outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Your First Email
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      <SendEmailModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
      />
    </div>
  )
}
