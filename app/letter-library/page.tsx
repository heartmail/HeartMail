import LetterLibraryLayout from '@/components/letter-library/letter-library-layout'
import LetterLibraryHero from '@/components/letter-library/letter-library-hero'
import CategoriesSection from '@/components/letter-library/categories-section'
import FeaturedTemplates from '@/components/letter-library/featured-templates'
import Footer from '@/components/layout/footer'

export default function LetterLibraryPage() {
  return (
    <LetterLibraryLayout>
      <LetterLibraryHero />
      <CategoriesSection />
      <FeaturedTemplates />
      <Footer />
    </LetterLibraryLayout>
  )
}
