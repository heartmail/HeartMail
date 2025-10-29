'use client'

import { useState, useEffect } from 'react'
import { Plus, Users, Palette, Calendar, Mail, Camera, Check, Clock, UserPlus, AlertTriangle, Heart, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useRouter } from 'next/navigation'
import SendEmailModal from '@/components/email/send-email-modal'
import ActivityHistoryModal from './activity-history-modal'
import { useSubscription } from '@/lib/subscription-context'

const quickActions = [
  { icon: Plus, label: 'Add Recipient', href: '/dashboard/recipients' },
  { icon: Palette, label: 'Browse Templates', href: '/letter-library' },
  { icon: Calendar, label: 'Schedule Email', href: '/dashboard/schedule' },
  { icon: Camera, label: 'Upload Photos', href: '/dashboard/schedule' },
]

export default function DashboardContent() {
  const { data, loading, error, refetch } = useDashboardData() as {
    data: any
    loading: boolean
    error: string | null
    refetch: () => void
  }
  const router = useRouter()
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showActivityHistory, setShowActivityHistory] = useState(false)
  const { subscription } = useSubscription()

  const handleEmailSent = () => {
    // Refresh dashboard data after email is sent
    if (refetch) {
      refetch()
    }
  }

  // Listen for email sent/scheduled events to update stats
  useEffect(() => {
    const handleEmailEvent = () => {
      if (refetch) {
        refetch()
      }
    }

    window.addEventListener('emailSent', handleEmailEvent)
    window.addEventListener('emailScheduled', handleEmailEvent)

    return () => {
      window.removeEventListener('emailSent', handleEmailEvent)
      window.removeEventListener('emailScheduled', handleEmailEvent)
    }
  }, [refetch])

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
      label: 'Scheduled Emails', 
      value: data.stats?.scheduledEmails?.toString() || '0', 
      icon: Clock, 
      change: data.stats?.scheduledEmails > 0 ? 'Next: Tomorrow' : 'No emails scheduled',
      changeType: data.stats?.scheduledEmails > 0 ? 'positive' : 'neutral'
    },
  ]
  // Get plan name and limits
  const planName = subscription?.plan || 'Free'
  const isPremium = planName !== 'Free'

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your HeartMail.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            className="btn-heartmail btn-responsive"
            onClick={() => setShowEmailModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Email</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="dashboard-card card-hover">
            <div className="flex items-center space-x-4 p-6">
              <div className="w-14 h-14 bg-heartmail-pink rounded-lg flex items-center justify-center flex-shrink-0">
                <stat.icon className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-medium text-gray-700 mt-1">{stat.label}</div>
                <div className={`text-sm mt-1 ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'neutral' ? 'text-gray-600' : 'text-red-600'}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade Banner - Show if not premium */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-heartmail-pink via-pink-500 to-purple-600 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm font-semibold text-white bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Currently on {planName} Plan
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Unlock More Love & Connection
                </h3>
                <p className="text-pink-100 text-lg">
                  Upgrade to send unlimited emails, schedule more messages, and connect with everyone you love.
                </p>
              </div>
              <div className="flex-shrink-0">
                <a 
                  href="https://heartsmail.com/#pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white text-heartmail-pink rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Upgrade Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Badge - Show if premium */}
      {isPremium && (
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-heartmail-pink rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {planName} Plan Active
                  </h3>
                  <p className="text-pink-100">
                    Thank you for spreading love! ❤️
                  </p>
                </div>
              </div>
              <a 
                href="https://heartsmail.com/#pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-pink-100 font-medium text-sm underline"
              >
                View Plans
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Emails - Full Width */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="text-xl font-bold text-gray-900">Upcoming Emails</h3>
          <button 
            className="text-sm text-heartmail-pink hover:text-pink-600 font-medium"
            onClick={() => router.push('/dashboard/schedule?view=list')}
          >
            View All
          </button>
        </div>
        <div className="schedule-list">
          {data.upcomingEmails.length > 0 ? (
            data.upcomingEmails.map((email: any, index: number) => (
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
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No upcoming emails</p>
              <p className="text-sm text-gray-400 mb-4">Start spreading love by scheduling your first heartfelt message</p>
              <Button 
                className="mt-4 btn-heartmail"
                onClick={() => router.push('/dashboard/schedule')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Your First Email
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Activity History - Full Width */}
      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="text-xl font-bold text-gray-900">Activity History</h3>
          <button 
            className="btn-text"
            onClick={() => setShowActivityHistory(true)}
          >
            View All
          </button>
        </div>
        <div className="activity-list">
          {data.recentActivity.length > 0 ? (
            data.recentActivity.map((activity: any, index: number) => (
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
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No recent activity</p>
              <p className="text-sm text-gray-400 mt-2">Your email history will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      <SendEmailModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)}
        onEmailSent={handleEmailSent}
      />

      {/* Activity History Modal */}
      <ActivityHistoryModal 
        isOpen={showActivityHistory} 
        onClose={() => setShowActivityHistory(false)} 
      />
    </div>
  )
}
