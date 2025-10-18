'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, Palette, Calendar, Settings, Bell, Plus, LogOut, ChevronLeft, ChevronRight, BookOpen, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import Logo from '@/components/ui/logo'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/recipients', label: 'Recipients', icon: Users },
  { href: '/dashboard/templates', label: 'Templates', icon: Palette },
  { href: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
  { href: '/dashboard/photos', label: 'Photos', icon: Image },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const router = useRouter()

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    setIsMounted(true)
    const savedState = localStorage.getItem('sidebar-collapsed')
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed))
    }
  }, [sidebarCollapsed, isMounted])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <div className="w-60 h-screen bg-white border-r border-gray-200"></div>
          <div className="flex-1">
            <div className="p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        
        <div className="sidebar-header">
          <div className="logo">
            <Logo size={24} className="h-6 w-6" />
            <span>HeartMail</span>
          </div>
        </div>
        <div className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.href}
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={() => router.push(item.href)}
                type="button"
                aria-label={`Navigate to ${item.label}`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
        <div className="sidebar-footer">
          <Link href={`/dashboard/profile/${user?.id}`} className="user-profile block hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="user-avatar">
                <Users className="h-5 w-5" />
              </div>
              <div className="user-info">
                <div className="user-name">{user?.email || 'User'}</div>
                <div className="user-plan">Free Plan</div>
              </div>
            </div>
          </Link>
          <div className="mt-4">
            <button
              className="w-full btn-heartmail flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium"
              onClick={() => router.push('/letter-library')}
            >
              <BookOpen className="h-4 w-4" />
              <span>Letter Library</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Dashboard Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  )
}
