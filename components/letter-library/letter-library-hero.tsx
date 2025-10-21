'use client'

import Link from 'next/link'
import { Search, Home } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LetterLibraryHero() {
  return (
    <section className="relative py-20 heartmail-gradient overflow-hidden">
      {/* Floating Hearts */}
      <div className="floating-hearts">
        <div className="floating-heart">💖</div>
        <div className="floating-heart">💕</div>
        <div className="floating-heart">💗</div>
        <div className="floating-heart">💝</div>
        <div className="floating-heart">💘</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Button */}
        <div className="flex justify-start mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="bg-white/95 backdrop-blur-sm border-white/30 text-gray-800 hover:bg-white hover:text-heartmail-pink px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Centered Content */}
        <div className="text-center">
          <h1 className="hero-title">
            Letter <span className="text-pink-300 underline decoration-pink-300 decoration-4 underline-offset-4">Library</span>
          </h1>
          <p className="hero-subtitle">
            Discover beautiful, heartfelt letter templates for every occasion. 
            From daily check-ins to special celebrations, find the perfect words to express your love.
          </p>
          
          {/* Coming Soon Badge */}
          <div className="mb-8">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-red-500 text-2xl font-bold px-8 py-4 rounded-full border border-white/30 shadow-lg">
              Coming Soon
            </span>
          </div>
          
          {/* Search Box */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              placeholder="Search letters and templates..." 
              className="pl-12 pr-4 py-4 text-lg rounded-full border-0 shadow-lg"
              disabled
            />
          </div>
        </div>
      </div>
    </section>
  )
}
