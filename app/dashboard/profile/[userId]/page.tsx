'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ArrowLeft, Heart, Calendar, Mail, User, Image as ImageIcon, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getUserPhotos, getPhotoUrl, UserPhoto } from '@/lib/photo-library'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface PublicTemplate {
  id: string
  title: string
  content: string
  category: string
  is_public: boolean
  created_at: string
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [publicTemplates, setPublicTemplates] = useState<PublicTemplate[]>([])
  const [profilePhoto, setProfilePhoto] = useState<UserPhoto | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<PublicTemplate | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const profileUserId = params?.userId as string

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (profileUserId) {
      fetchProfileData()
    }
  }, [profileUserId])

  const fetchProfileData = async () => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', profileUserId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      setUserProfile(profile)

      // Get public templates
      const { data: templates, error: templatesError } = await supabase
        .from('templates')
        .select(`
          id,
          title,
          content,
          category,
          is_public,
          created_at
        `)
        .eq('user_id', profileUserId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (templatesError) throw templatesError
      setPublicTemplates(templates || [])

      // Get profile photo
      if (profile?.avatar_url) {
        const { data: photos } = await supabase
          .from('user_photos')
          .select('*')
          .eq('user_id', profileUserId)
          .eq('is_profile_photo', true)
          .single()

        setProfilePhoto(photos)
      }

    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewTemplate = (template: PublicTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heartmail-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">This user profile doesn't exist or is private.</p>
          <Link href="/dashboard">
            <Button className="btn-heartmail">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const displayName = userProfile.username || userProfile.display_name || userProfile.email?.split('@')[0] || 'Anonymous User'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="text-sm text-gray-500">
              {userProfile.user_id === user?.id ? 'Your Profile' : 'Public Profile'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                {profilePhoto ? (
                  <img
                    src={getPhotoUrl(profilePhoto.storage_path)}
                    alt={displayName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-heartmail-pink"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-heartmail-pink to-pink-600 flex items-center justify-center border-4 border-heartmail-pink">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
                <p className="text-gray-600 mb-4">@{displayName}</p>
                
                {userProfile.bio && (
                  <p className="text-gray-700 mb-4">{userProfile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1 text-heartmail-pink" />
                    <span>{publicTemplates.length} Public Templates</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span>Joined {new Date(userProfile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Public Templates */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Public Templates</h2>
          
          {publicTemplates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Public Templates</h3>
                <p className="text-gray-600">
                  {userProfile.user_id === user?.id 
                    ? "You haven't made any templates public yet."
                    : "This user hasn't shared any public templates yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-3">
                      {template.content}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(template.created_at).toLocaleDateString()}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewTemplate(template)}
                      >
                        View Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template View Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedTemplate?.title}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplateModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              <Badge variant="secondary" className="mt-2">
                {selectedTemplate?.category}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Template Content:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {selectedTemplate.content}
                  </pre>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                <span>Created: {new Date(selectedTemplate.created_at).toLocaleDateString()}</span>
                <span>Public Template</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
