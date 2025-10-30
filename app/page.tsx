'use client'

import dynamicImport from 'next/dynamic'
import Navbar from '@/components/layout/navbar'
import HeroSection from '@/components/sections/hero-section'
import AuthInitializer from '@/components/auth/auth-initializer'
import { ErrorBoundary } from '@/components/error-boundary'
import { Suspense, useEffect } from 'react'

// Force dynamic rendering to prevent AuthProvider issues during build
export const dynamic = 'force-dynamic'

// Lazy load non-critical components
const Footer = dynamicImport(() => import('@/components/layout/footer'), {
  loading: () => <div className="h-32 bg-gray-50" />,
})

const FeaturesSection = dynamicImport(() => import('@/components/sections/features-section'), {
  loading: () => <div className="h-96 bg-gray-50" />,
})

const AboutSection = dynamicImport(() => import('@/components/sections/about-section'), {
  loading: () => <div className="h-96 bg-gray-50" />,
})

const PricingSection = dynamicImport(() => import('@/components/sections/pricing-section-wrapper'), {
  loading: () => <div className="h-96 bg-gray-50" />,
})

const CTASection = dynamicImport(() => import('@/components/sections/cta-section'), {
  loading: () => <div className="h-64 bg-gray-50" />,
})

export default function Home() {
  // Remove all auth hook usage from this component
  // Auth state will be handled by the AuthProvider in layout.tsx

  // Handle anchor link scrolling
  useEffect(() => {
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault()
        const targetId = target.getAttribute('href')?.substring(1)
        if (targetId) {
          const element = document.getElementById(targetId)
          if (element) {
            const navbarHeight = 64 // h-16 = 64px
            const elementPosition = element.offsetTop - navbarHeight
            window.scrollTo({
              top: elementPosition,
              behavior: 'smooth'
            })
          }
        }
      }
    }

    // Add event listener to all anchor links
    document.addEventListener('click', handleAnchorClick)
    
    // Handle URL hash on page load
    if (window.location.hash) {
      setTimeout(() => {
        const targetId = window.location.hash.substring(1)
        const element = document.getElementById(targetId)
        if (element) {
          const navbarHeight = 64
          const elementPosition = element.offsetTop - navbarHeight
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          })
        }
      }, 100) // Small delay to ensure page is loaded
    }

    return () => {
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [])

  return (
    <ErrorBoundary>
      <AuthInitializer>
        <div className="min-h-screen">
          <Navbar />
          <main className="relative">
            {/* Background Image - Full width coverage */}
            <div 
              className="full-width-bg"
              style={{
                backgroundImage: 'url(https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/heartmail_optimized/no_wm_background_desktop_1920x1080.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                backgroundColor: '#f3f4f6', // Fallback color
              }}
              onError={(e) => {
                // Fallback to gradient if image fails to load
                e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            />
            
            {/* Content */}
            <div className="relative">
              {/* Hero section with dark overlay */}
              <div className="relative">
                <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
                <div className="relative">
                  <HeroSection />
                </div>
              </div>
              <Suspense fallback={<div className="h-96 bg-gray-50" />}>
                <FeaturesSection />
              </Suspense>
              <Suspense fallback={<div className="h-96 bg-gray-50" />}>
                <AboutSection />
              </Suspense>
              <Suspense fallback={<div className="h-96 bg-gray-50" />}>
                <PricingSection />
              </Suspense>
              <Suspense fallback={<div className="h-64 bg-gray-50" />}>
                <CTASection />
              </Suspense>
              <Suspense fallback={<div className="h-32 bg-gray-50" />}>
                <Footer />
              </Suspense>
            </div>
          </main>
        </div>
      </AuthInitializer>
    </ErrorBoundary>
  )
}
