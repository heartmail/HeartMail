'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, Palette, Calendar, Settings, Bell, Plus, LogOut, ChevronLeft, ChevronRight, BookOpen, Image, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import Logo from '@/components/ui/logo'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/recipients', label: 'Recipients', icon: Users },
  { href: '/dashboard/templates', label: 'Templates', icon: Palette },
  { href: '/dashboard/schedule', label: 'Schedule', icon: Calendar },
  { href: '/dashboard/photos', label: 'Photos (coming soon)', icon: Image, disabled: true },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
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

  // Mobile detection and responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
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
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const closeMobileSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Header */}
      {isMobile && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <Logo size={24} className="h-6 w-6" />
            <span className="text-xl font-bold text-heartmail-pink">HeartMail</span>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <nav className={`
        sidebar 
        ${sidebarCollapsed && !isMobile ? 'collapsed' : ''} 
        ${isMobile ? (sidebarOpen ? 'mobile-open' : 'mobile-closed') : ''}
      `}>
        {/* Desktop Toggle Button */}
        {!isMobile && (
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}

        {/* Mobile Close Button */}
        {isMobile && (
          <button 
            className="mobile-close-btn"
            onClick={closeMobileSidebar}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        <div className="sidebar-header">
          <div className="logo">
            <Logo size={24} className="h-6 w-6" />
            <span>HeartMail</span>
          </div>
        </div>
        <div className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const isDisabled = item.disabled
            return (
              <button
                key={item.href}
                className={`menu-item ${isActive ? 'active' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (!isDisabled) {
                    router.push(item.href)
                    if (isMobile) {
                      closeMobileSidebar()
                    }
                  }
                }}
                type="button"
                aria-label={`Navigate to ${item.label}`}
                disabled={isDisabled}
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
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <Users className="h-5 w-5" />
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.user_metadata?.username || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}</div>
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
      <main className={`
        main-content 
        ${isMobile ? 'mobile-main' : ''}
        ${sidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''}
      `}>
        {/* Dashboard Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  )
}
