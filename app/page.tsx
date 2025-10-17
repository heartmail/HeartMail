import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import HeroSection from '@/components/sections/hero-section'
import FeaturesSection from '@/components/sections/features-section'
import AboutSection from '@/components/sections/about-section'
import PricingSection from '@/components/sections/pricing-section'
import CTASection from '@/components/sections/cta-section'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
