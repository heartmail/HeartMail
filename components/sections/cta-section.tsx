import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CTASection() {
  return (
    <section className="py-20 text-white" style={{ background: 'linear-gradient(135deg, rgb(233, 30, 99), rgb(240, 98, 146))' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Ready to strengthen your family bonds?</h2>
        <p className="text-xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed">
          Join thousands of families who never miss a moment to show their love.
        </p>
        <Link href="/signup">
          <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100 text-lg px-10 py-6 font-semibold shadow-xl">
            Get Started Free
          </Button>
        </Link>
      </div>
    </section>
  )
}
