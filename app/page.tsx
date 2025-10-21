import dynamicImport from 'next/dynamic'
import Navbar from '@/components/layout/navbar'
import HeroSection from '@/components/sections/hero-section'
import { useAuth } from '@/lib/auth-context'
import { useAuthState } from '@/lib/use-auth-state'
import AuthInitializer from '@/components/auth/auth-initializer'

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
  // Use fast auth state check
  const { user, isAuthenticated, loading } = useAuthState()
  
  // Fallback to old auth context if needed
  let fallbackUser = null
  try {
    const authContext = useAuth()
    fallbackUser = authContext?.user
  } catch (error) {
    // AuthProvider not available, continue without user
    console.log('AuthProvider not available in Home page')
  }
  
  // Use the most reliable user data
  const currentUser = user || fallbackUser

  return (
    <AuthInitializer>
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
    </AuthInitializer>
  )
}
