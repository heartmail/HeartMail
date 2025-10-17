import StripePricing from '@/components/pricing/stripe-pricing'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your family. All plans include our core features to keep your loved ones connected.
          </p>
        </div>
        
        <StripePricing />
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Questions about our pricing? We're here to help.
          </p>
          <a 
            href="mailto:heartmailio@gmail.com" 
            className="text-heartmail-pink hover:underline"
          >
            Contact us at heartmailio@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
}
