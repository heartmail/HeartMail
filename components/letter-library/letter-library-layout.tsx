'use client'

import Link from 'next/link'
import { Heart, Home } from 'lucide-react'

interface LetterLibraryLayoutProps {
  children: React.ReactNode
}

export default function LetterLibraryLayout({ children }: LetterLibraryLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
