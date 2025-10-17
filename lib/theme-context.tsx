'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { updateUserPreferences } from '@/lib/database'
import { useAuth } from '@/lib/auth-context'

interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('heartmail-theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setThemeState(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
  }, [])

  const setTheme = async (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme)
    localStorage.setItem('heartmail-theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    
    // Save to database if user is logged in
    if (user) {
      try {
        await updateUserPreferences(user.id, { theme: newTheme })
      } catch (error) {
        console.error('Failed to save theme preference:', error)
      }
    }
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
