import { Clock, Users, Palette, Heart, Shield, Smartphone } from 'lucide-react'

const features = [
  {
    icon: Clock,
    title: 'Automated Scheduling',
    description: 'Set daily, weekly, or monthly emails. Once configured, your love is delivered automatically.'
  },
  {
    icon: Users,
    title: 'Multiple Recipients',
    description: 'Send to grandparents, family friends, and loved ones. Keep everyone connected.'
  },
  {
    icon: Palette,
    title: 'Beautiful Templates',
    description: 'Choose from hundreds of templates designed for different occasions and relationships.'
  },
  {
    icon: Heart,
    title: 'Personal Touch',
    description: 'Customize every email with personal photos, stories, and heartfelt messages.'
  },
  {
    icon: Shield,
    title: 'Reliable Delivery',
    description: '99% deliverability rate ensures your emails reach their inbox, not spam.'
  },
  {
    icon: Smartphone,
    title: 'Easy to Use',
    description: 'Simple setup in minutes. No technical knowledge required.'
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why HeartMail?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Never let distance weaken the bonds of love
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
