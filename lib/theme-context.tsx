'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  
  const pathname = usePathname()

  // Pages that should always be in light mode
  const lightModePages = [
    '/',
    '/login',
    '/signup', 
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/update-password'
  ]

  const shouldForceLightMode = lightModePages.some(page => pathname?.startsWith(page))

  useEffect(() => {
    setMounted(true)
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('heartmail-theme') as 'light' | 'dark' | null
    if (savedTheme && !shouldForceLightMode) {
      setThemeState(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    } else {
      // Force light mode for auth pages
      setThemeState('light')
      document.documentElement.classList.remove('dark')
    }
  }, [shouldForceLightMode])

  const setTheme = (newTheme: 'light' | 'dark') => {
    // Don't allow dark mode on auth pages
    if (shouldForceLightMode && newTheme === 'dark') {
      return
    }
    
    setThemeState(newTheme)
    localStorage.setItem('heartmail-theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
