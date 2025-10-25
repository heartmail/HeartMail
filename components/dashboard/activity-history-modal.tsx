'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Calendar, Mail, User, FileText, Settings, Clock, X } from 'lucide-react'
import { ActivityHistory, getActivityHistory, ActivityHistoryFilters } from '@/lib/activity-history'
import { useAuth } from '@/lib/auth-context'

interface ActivityHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ActivityHistoryModal({ isOpen, onClose }: ActivityHistoryModalProps) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activityType, setActivityType] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const itemsPerPage = 20

  useEffect(() => {
    if (isOpen && user) {
      fetchActivities()
    }
  }, [isOpen, user, searchTerm, activityType, dateRange, currentPage])

  const fetchActivities = async () => {
    if (!user) return

    setLoading(true)
    try {
      const filters: ActivityHistoryFilters = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      }

      if (searchTerm) {
        filters.search = searchTerm
      }

      if (activityType !== 'all') {
        filters.activity_type = activityType
      }

      if (dateRange !== 'all') {
        const now = new Date()
        switch (dateRange) {
          case 'today':
            filters.start_date = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
            break
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            filters.start_date = weekAgo.toISOString()
            break
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            filters.start_date = monthAgo.toISOString()
            break
        }
      }

      const data = await getActivityHistory(user.id, filters)
      setActivities(data)
      setTotalCount(data.length) // This would need to be updated to get actual total count
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email_sent':
        return <Mail className="h-4 w-4" />
      case 'email_scheduled':
        return <Calendar className="h-4 w-4" />
      case 'recipient_added':
      case 'recipient_updated':
        return <User className="h-4 w-4" />
      case 'template_created':
      case 'template_updated':
        return <FileText className="h-4 w-4" />
      case 'settings_changed':
        return <Settings className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'email_sent':
        return 'bg-green-100 text-green-800'
      case 'email_scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'recipient_added':
        return 'bg-purple-100 text-purple-800'
      case 'recipient_updated':
        return 'bg-orange-100 text-orange-800'
      case 'template_created':
        return 'bg-pink-100 text-pink-800'
      case 'template_updated':
        return 'bg-yellow-100 text-yellow-800'
      case 'settings_changed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setActivityType('all')
    setDateRange('all')
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <>
      {/* Custom overlay to ensure modal appears above sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[1000]"
          onClick={onClose}
        />
      )}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] w-full h-[95vh] flex flex-col p-0 z-[1001]"
          aria-describedby="activity-history-description"
          style={{ zIndex: 1001 }}
        >
          <div id="activity-history-description" className="sr-only">
            View and filter your HeartMail activity history including sent emails, template usage, and account actions.
          </div>
        
        <div className="flex flex-col h-full p-6">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center space-x-2 text-2xl">
              <Clock className="h-6 w-6 text-heartmail-pink" />
              <span>Activity History</span>
            </DialogTitle>
            <DialogDescription>
              View and search through all your HeartMail activity
            </DialogDescription>
          </DialogHeader>

          {/* Search and Filter Controls */}
          <div className="flex-shrink-0 space-y-4 border-b pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Activity Type Filter */}
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email_sent">Emails Sent</SelectItem>
                <SelectItem value="email_scheduled">Emails Scheduled</SelectItem>
                <SelectItem value="recipient_added">Recipients Added</SelectItem>
                <SelectItem value="recipient_updated">Recipients Updated</SelectItem>
                <SelectItem value="template_created">Templates Created</SelectItem>
                <SelectItem value="template_updated">Templates Updated</SelectItem>
                <SelectItem value="settings_changed">Settings Changed</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

          {/* Activity List */}
          <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-heartmail-pink"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">
                {searchTerm || activityType !== 'all' || dateRange !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Your activity history will appear here as you use HeartMail'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type)}`}>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {activity.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className={getActivityColor(activity.activity_type)}>
                              {activity.activity_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(activity.created_at)}
                            </span>
                          </div>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>
                        )}
                        {activity.metadata && (
                          <div className="mt-2 text-xs text-gray-500">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <span key={key} className="mr-4">
                                <strong>{key.replace('_', ' ')}:</strong> {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages} ({totalCount} total activities)
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex-shrink-0 flex justify-end pt-4 border-t">
            <Button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
