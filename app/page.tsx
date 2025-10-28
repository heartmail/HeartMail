'use client'

import dynamicImport from 'next/dynamic'
import Navbar from '@/components/layout/navbar'
import HeroSection from '@/components/sections/hero-section'
import AuthInitializer from '@/components/auth/auth-initializer'
import { ErrorBoundary } from '@/components/error-boundary'
import { Suspense } from 'react'

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

  return (
    <ErrorBoundary>
      <AuthInitializer>
        <main className="min-h-screen relative">
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
          
          {/* Content with overlay */}
          <div className="relative z-10">
            <Navbar />
            <HeroSection />
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
      </AuthInitializer>
    </ErrorBoundary>
  )
}
