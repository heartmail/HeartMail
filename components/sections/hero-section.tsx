'use client'

import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

export default function HeroSection() {
  return (
    <section 
      className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Strong overlay for better text readability */}
      <div className="absolute inset-0 bg-black/70"></div>
      
      {/* Additional gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50"></div>
      
      {/* Floating hearts */}
      <div className="absolute inset-0">
        <div className="floating-hearts">
          <div className="floating-heart">💖</div>
          <div className="floating-heart">💕</div>
          <div className="floating-heart">💗</div>
          <div className="floating-heart">💝</div>
          <div className="floating-heart">💘</div>
          <div className="floating-heart">💖</div>
          <div className="floating-heart">💕</div>
          <div className="floating-heart">💗</div>
        </div>
      </div>

      <div className="hero-content relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            <h1 className="hero-title">
              Keeping <span className="text-pink-300 underline decoration-pink-300 decoration-4 underline-offset-4">hearts</span> connected, one email at a time
            </h1>
            <p className="hero-subtitle">
              Automatically send heartfelt emails to your loved ones. 
              Set it once, and let HeartMail deliver your love on schedule.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button size="lg" className="btn-heartmail text-lg px-8 py-4">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="btn-heartmail-outline text-lg px-8 py-4">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 justify-center lg:justify-start text-white">
              <div className="text-center bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl lg:text-3xl font-bold text-pink-300" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'}}>10,000+</div>
                <div className="text-sm text-white" style={{textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'}}>Emails Sent</div>
              </div>
              <div className="text-center bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl lg:text-3xl font-bold text-pink-300" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'}}>500+</div>
                <div className="text-sm text-white" style={{textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'}}>Happy Families</div>
              </div>
              <div className="text-center bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl lg:text-3xl font-bold text-pink-300" style={{textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'}}>99%</div>
                <div className="text-sm text-white" style={{textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'}}>Deliverability</div>
              </div>
            </div>
          </div>

          {/* Right Content - Email Preview */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-r from-heartmail-pink to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">S</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Sarah Johnson</div>
                  <div className="text-sm text-gray-500">to Grandma Rose</div>
                </div>
                <div className="text-sm text-gray-500">2 min ago</div>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Hi Grandma! 💕</h3>
                <p className="text-gray-700 leading-relaxed">
                  I hope you're having a wonderful day! I've been thinking about you and wanted to share some updates from this week...
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                  <span>📷</span>
                  <span>Family photo from last weekend</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
