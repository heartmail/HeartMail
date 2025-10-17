'use client'

import Link from 'next/link'
import { Heart, Home } from 'lucide-react'

interface LetterLibraryLayoutProps {
  children: React.ReactNode
}

export default function LetterLibraryLayout({ children }: LetterLibraryLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Letter Library */}
      <nav className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col shadow-md">
        <div className="flex items-center space-x-2 mb-8">
          <Heart className="h-6 w-6 text-heartmail-pink fill-heartmail-pink" />
          <span className="text-xl font-bold text-gray-800">HeartMail</span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-heartmail-pink transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
