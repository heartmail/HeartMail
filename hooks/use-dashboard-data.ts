'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context-new'
import { getDashboardStats, getRecentActivity, getRecipients, getUpcomingEmails } from '@/lib/database'

interface Activity {
  id: string
  type: 'info' | 'success'
  message: string
  time: string
  icon: string
}

interface Recipient {
  id: string
  name: string
  email: string
  relationship?: string
  status: 'active' | 'inactive'
  created_at: string
}

interface UpcomingEmail {
  id: string
  title: string
  recipient: string
  date: string
  time: string
  status: string
}

export function useDashboardData(): {
  data: {
    stats: any
    recentActivity: Activity[]
    recipients: Recipient[]
    upcomingEmails: UpcomingEmail[]
  }
  loading: boolean
  error: string | null
  refetch: () => void
} {
  const { user } = useAuth()
  const [data, setData] = useState<{
    stats: any
    recentActivity: Activity[]
    recipients: Recipient[]
    upcomingEmails: UpcomingEmail[]
  }>({
    stats: null,
    recentActivity: [],
    recipients: [],
    upcomingEmails: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Dashboard data fetch timeout')), 15000)
      )
      
      const dataPromise = Promise.all([
        getDashboardStats(user.id),
        getRecentActivity(user.id),
        getRecipients(user.id),
        getUpcomingEmails(user.id)
      ])
      
      const [stats, recentActivity, recipients, upcomingEmails] = await Promise.race([
        dataPromise,
        timeoutPromise
      ]) as any

      setData({
        stats,
        recentActivity: recentActivity.map((activity: any) => ({
          ...activity,
          type: activity.type as 'info' | 'success'
        })),
        recipients: recipients.map((recipient: any) => ({
          ...recipient,
          status: recipient.status as 'active' | 'inactive'
        })),
        upcomingEmails
      })
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  // Periodic refresh to catch scheduled emails
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchData()
    }, 60000) // Refresh every 60 seconds to reduce frequency

    return () => clearInterval(interval)
  }, [user])

  // Listen for email events to refresh immediately
  useEffect(() => {
    if (!user) return

    const handleEmailEvent = () => {
      console.log('🔄 Dashboard data hook: Email event received, fetching fresh data...')
      // Add a small delay to ensure database has been updated
      setTimeout(() => {
        fetchData()
      }, 100)
    }

    window.addEventListener('emailSent', handleEmailEvent)
    window.addEventListener('emailScheduled', handleEmailEvent)
    window.addEventListener('refreshDashboard', handleEmailEvent)

    return () => {
      window.removeEventListener('emailSent', handleEmailEvent)
      window.removeEventListener('emailScheduled', handleEmailEvent)
      window.removeEventListener('refreshDashboard', handleEmailEvent)
    }
  }, [user])

  const refetch = () => {
    fetchData()
  }

  return { data, loading, error, refetch }
}
