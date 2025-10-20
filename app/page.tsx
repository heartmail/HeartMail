import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import HeroSection from '@/components/sections/hero-section'
import FeaturesSection from '@/components/sections/features-section'
import AboutSection from '@/components/sections/about-section'
import PricingSection from '@/components/sections/pricing-section'
import CTASection from '@/components/sections/cta-section'

// Force dynamic rendering to prevent AuthProvider issues during build
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Background Image */}
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
