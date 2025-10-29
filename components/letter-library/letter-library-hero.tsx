'use client'

import Link from 'next/link'
import { Search, Home } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LetterLibraryHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 overflow-hidden">
      {/* Floating Hearts */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="floating-hearts">
          <div className="floating-heart">💖</div>
          <div className="floating-heart">💕</div>
          <div className="floating-heart">💗</div>
          <div className="floating-heart">💝</div>
          <div className="floating-heart">💘</div>
          <div className="floating-heart">💖</div>
          <div className="floating-heart">💗</div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        {/* Dashboard Button - Positioned Top Left */}
        <div className="absolute top-8 left-8">
          <Link href="https://heartsmail.com/dashboard">
            <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-pink-600 px-6 py-3 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Main Content - Centered */}
        <div className="space-y-8">
          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6" style={{textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'}}>
            Letter <span className="text-pink-200 underline decoration-pink-200 decoration-4 underline-offset-8">Library</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed" style={{textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'}}>
            Discover beautiful, heartfelt letter templates for every occasion. 
            From daily check-ins to special celebrations, find the perfect words to express your love.
          </p>
          
          {/* Coming Soon Badge */}
          <div className="py-4">
            <span className="inline-block bg-white text-pink-600 text-2xl lg:text-3xl font-bold px-10 py-5 rounded-full shadow-2xl border-4 border-pink-200 animate-pulse">
              COMING SOON
            </span>
          </div>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
              <Input 
                placeholder="Search letters and templates..." 
                className="pl-16 pr-6 py-6 text-lg rounded-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm hover:bg-white transition-all"
                disabled
              />
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="w-24 h-1 bg-white/30 rounded-full"></div>
            <div className="text-white/80 text-lg font-medium">✨ Coming Soon ✨</div>
            <div className="w-24 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
