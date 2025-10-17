'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="hero-title">
          Letter <span className="text-pink-300 underline decoration-pink-300 decoration-4 underline-offset-4">Library</span>
        </h1>
        <p className="hero-subtitle">
          Discover beautiful, heartfelt letter templates for every occasion. 
          From daily check-ins to special celebrations, find the perfect words to express your love.
        </p>
        
        {/* Search Box */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input 
            placeholder="Search letters and templates..." 
            className="pl-12 pr-4 py-4 text-lg rounded-full border-0 shadow-lg"
          />
        </div>
      </div>
    </section>
  )
}
