'use client'

import { useState, useEffect } from 'react'
import { UserProfile, getUserProfile, formatUserDisplay, getUserInitials } from '@/lib/user-utils'

interface UserDisplayProps {
  userId: string
  showEmail?: boolean
  showInitials?: boolean
  className?: string
}

export default function UserDisplay({ 
  userId, 
  showEmail = true, 
  showInitials = false, 
  className = '' 
}: UserDisplayProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userProfile = await getUserProfile(userId)
        setUser(userProfile)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <span className={`text-gray-500 ${className}`}>
        Unknown User
      </span>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showInitials && (
        <div className="w-8 h-8 bg-heartmail-pink rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {getUserInitials(user)}
        </div>
      )}
      {showEmail && (
        <span className="text-gray-900 font-medium">
          {formatUserDisplay(user)}
        </span>
      )}
    </div>
  )
}

// Simple component for just showing the email
export function UserEmail({ userId, className = '' }: { userId: string, className?: string }) {
  return (
    <UserDisplay 
      userId={userId} 
      showEmail={true} 
      showInitials={false} 
      className={className}
    />
  )
}

// Component for user avatar with initials
export function UserAvatar({ userId, size = 'sm', className = '' }: { 
  userId: string, 
  size?: 'sm' | 'md' | 'lg',
  className?: string 
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  }

  return (
    <UserDisplay 
      userId={userId} 
      showEmail={false} 
      showInitials={true} 
      className={`${sizeClasses[size]} ${className}`}
    />
  )
}
