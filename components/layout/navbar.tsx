'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import LoggedInNavbar from './logged-in-navbar'
import Logo from '@/components/ui/logo'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Safely get user from auth context
  let user = null
  try {
    const auth = useAuth()
    user = auth?.user
  } catch (error) {
    // Auth context not available yet, user is null
    user = null
  }

  // Show logged-in navbar if user is authenticated
  if (user) {
    return <LoggedInNavbar />
  }

  const navItems = [
    { href: '#features', label: 'Features' },
    { href: '/letter-library', label: 'Letter Library' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#about', label: 'About' },
    { href: '/login', label: 'Login' },
  ]

  return (
    <nav className="fixed top-0 w-full bg-white/95 navbar-blur border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Logo size={32} className="h-8 w-8" />
            <span className="text-2xl font-bold text-heartmail-pink">HeartMail</span>
          </Link>

          {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-700 hover:text-heartmail-pink transition-all duration-200 link-smooth"
                  >
                    {item.label}
                  </Link>
                ))}
            <Link href="/signup">
              <Button className="btn-heartmail">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-heartmail-pink transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-heartmail-pink transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Link href="/signup">
                  <Button className="btn-heartmail w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
