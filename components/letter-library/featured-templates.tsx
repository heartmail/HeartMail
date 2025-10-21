'use client'

import { useState, useEffect } from 'react'
import { Eye, Plus, Heart, HeartPulse, Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getFeaturedTemplates, LetterTemplate } from '@/lib/letter-library'

const iconMap = {
  'love': Heart,
  'health': HeartPulse,
  'memories': Camera,
  'holidays': Heart,
  'motivation': Heart,
  'default': Heart
}

export default function FeaturedTemplates() {
  const [templates, setTemplates] = useState<LetterTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeaturedTemplates()
  }, [])

  const fetchFeaturedTemplates = async () => {
    try {
      setLoading(true)
      const data = await getFeaturedTemplates()
      setTemplates(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Templates</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Most popular letters from our community
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-heartmail-pink mx-auto mb-4" />
              <p className="text-gray-600">Loading featured templates...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Templates</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Most popular letters from our community
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading templates: {error}</p>
            <Button onClick={fetchFeaturedTemplates} className="btn-heartmail-outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (templates.length === 0) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Templates</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Most popular letters from our community
            </p>
          </div>
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">No Featured Templates Yet</h3>
            <p className="text-gray-600">Check back soon for featured letter templates!</p>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Templates</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Most popular letters from our community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => {
            const IconComponent = iconMap[template.category as keyof typeof iconMap] || iconMap.default
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-heartmail-pink to-pink-400 rounded-xl flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant={template.is_premium ? "default" : "secondary"}>
                      {template.is_premium ? 'Premium' : 'Free'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-heartmail-pink">
                    <p className="text-gray-700 italic text-sm">
                      {template.content.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 opacity-50 cursor-not-allowed" disabled>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1 btn-heartmail opacity-50 cursor-not-allowed" disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
