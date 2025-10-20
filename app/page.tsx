import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/navbar'
import HeroSection from '@/components/sections/hero-section'

// Force dynamic rendering to prevent AuthProvider issues during build
export const dynamic = 'force-dynamic'

// Lazy load non-critical components
const Footer = dynamic(() => import('@/components/layout/footer'), {
  loading: () => <div className="h-32 bg-gray-50" />,
})

const FeaturesSection = dynamic(() => import('@/components/sections/features-section'), {
  loading: () => <div className="h-96 bg-gray-50" />,
})

const AboutSection = dynamic(() => import('@/components/sections/about-section'), {
  loading: () => <div className="h-96 bg-gray-50" />,
})

const PricingSection = dynamic(() => import('@/components/sections/pricing-section'), {
  loading: () => <div className="h-96 bg-gray-50" />,
})

const CTASection = dynamic(() => import('@/components/sections/cta-section'), {
  loading: () => <div className="h-64 bg-gray-50" />,
})

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Background Image - Optimized loading */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/background-home.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#f3f4f6', // Fallback color
        }}
      />
      
      {/* Content with overlay */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  )
}
