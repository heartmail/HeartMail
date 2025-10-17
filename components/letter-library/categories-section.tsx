'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, HeartPulse, Camera, Gift, Star, Crown, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCategories, Category } from '@/lib/letter-library'

const iconMap = {
  'love': Heart,
  'health': HeartPulse,
  'memories': Camera,
  'holidays': Gift,
  'motivation': Star,
  'premium': Crown,
  'default': Heart
}

const colorMap = {
  'love': 'from-heartmail-pink to-pink-400',
  'health': 'from-green-500 to-green-400',
  'memories': 'from-blue-500 to-blue-400',
  'holidays': 'from-purple-500 to-purple-400',
  'motivation': 'from-yellow-500 to-yellow-400',
  'premium': 'from-amber-500 to-amber-400',
  'default': 'from-gray-500 to-gray-400'
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      setCategories(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect letter for any occasion
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-heartmail-pink mx-auto mb-4" />
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect letter for any occasion
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading categories: {error}</p>
            <button 
              onClick={fetchCategories}
              className="btn-heartmail-outline"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect letter for any occasion
            </p>
          </div>
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold mb-2">No Categories Yet</h3>
            <p className="text-gray-600">Check back soon for letter categories!</p>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect letter for any occasion
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = iconMap[category.name.toLowerCase() as keyof typeof iconMap] || iconMap.default
            const colorClass = colorMap[category.name.toLowerCase() as keyof typeof colorMap] || colorMap.default
            return (
              <Link key={category.id} href={`/letter-library/${category.name.toLowerCase()}`}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader>
                    <div className={`w-16 h-16 bg-gradient-to-r ${colorClass} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">{category.template_count} templates</span>
                      <span className="text-heartmail-pink font-semibold group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
