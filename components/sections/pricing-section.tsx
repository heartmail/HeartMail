import StripePricing from '@/components/pricing/stripe-pricing'

export default function PricingSection() {
  return (
    <section id="pricing" className="pt-16 pb-48" style={{ backgroundColor: 'rgb(51, 51, 51)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Choose the plan that fits your family
          </p>
        </div>
        
        <StripePricing />
      </div>
    </section>
  )
}
