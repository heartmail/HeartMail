'use client'

import Link from 'next/link'
import { LayoutDashboard, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import Logo from '@/components/ui/logo'

export default function LoggedInNavbar() {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Logo size={32} className="h-8 w-8" />
            <span className="text-2xl font-bold text-heartmail-pink">HeartMail</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="text-gray-700 hover:text-heartmail-pink transition-all duration-200 flex items-center space-x-2 link-smooth"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/letter-library" 
              className="text-gray-700 hover:text-heartmail-pink transition-all duration-200 flex items-center space-x-2 link-smooth"
            >
              <BookOpen className="h-5 w-5" />
              <span>Letter Library</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gray-600">
              Welcome, {user?.email?.split('@')[0]}
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="sm"
              className="text-gray-700 hover:text-heartmail-pink hover:border-heartmail-pink"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
