import { Card, CardContent } from '@/components/ui/card'

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About HeartMail</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We believe that love knows no distance
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                HeartMail was born from a simple yet powerful realization: in our fast-paced digital world, 
                the people who matter most to us often get left behind. Grandparents, elderly family members, 
                and loved ones who may not be as tech-savvy deserve to feel connected and loved.
              </p>
              <p>
                Founded in 2025, HeartMail started as a personal project when our founder realized how 
                difficult it was to maintain regular contact with aging grandparents. The solution? 
                Automated, heartfelt emails that could be scheduled and personalized to keep those 
                precious relationships strong.
              </p>
              <p>
                Today, HeartMail serves thousands of families worldwide, helping them maintain 
                meaningful connections across generations and distances.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="w-80 h-80 bg-gradient-to-br from-heartmail-pink to-pink-400 rounded-3xl flex items-center justify-center p-8">
              <div className="text-center text-white">
                <img 
                  src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png" 
                  alt="HeartMail Logo" 
                  className="w-48 h-48 object-contain mx-auto mb-4"
                />
                <div className="text-xl font-semibold">HeartMail</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-heartmail-pink mb-2">10,000+</div>
              <div className="text-gray-600">Emails Sent</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-heartmail-pink mb-2">2,500+</div>
              <div className="text-gray-600">Happy Families</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-heartmail-pink mb-2">99%</div>
              <div className="text-gray-600">Deliverability</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-heartmail-pink mb-2">4.9/5</div>
              <div className="text-gray-600">User Rating</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
