import Image from 'next/image'

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image 
              src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png"
              alt="HeartMail Logo"
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">About HeartMail</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We believe that love knows no distance
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h3>
            <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
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
            <div className="w-80 h-80 bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl flex items-center justify-center p-8 shadow-2xl">
              <div className="text-center text-white">
                <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-32 h-32 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    <path d="M12 13L4 8v10h16V8l-8 5z" opacity="0.5"/>
                  </svg>
                </div>
                <div className="text-2xl font-bold">HeartMail</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center">
            <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2">10,000+</div>
            <div className="text-gray-600 font-medium">Emails Sent</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center">
            <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2">2,500+</div>
            <div className="text-gray-600 font-medium">Happy Families</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center">
            <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2">99%</div>
            <div className="text-gray-600 font-medium">Deliverability</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center">
            <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2">4.9/5</div>
            <div className="text-gray-600 font-medium">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}
