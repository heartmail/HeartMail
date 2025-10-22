'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Star, 
  Download, 
  Plus,
  X,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { 
  getUserPhotos, 
  uploadPhoto, 
  deletePhoto, 
  setProfilePhoto, 
  getPhotoUrl, 
  getUserStorageUsage,
  UserPhoto 
} from '@/lib/photo-library'
import { toast } from 'sonner'

export default function PhotosPage() {
  const [photos, setPhotos] = useState<UserPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<UserPhoto | null>(null)
  const [storageUsage, setStorageUsage] = useState({ totalPhotos: 0, totalSize: 0, storageLimit: 0 })
  const [canUpload, setCanUpload] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchPhotos()
      checkUserPlan()
    }
  }, [user])

  const fetchPhotos = async () => {
    try {
      const userPhotos = await getUserPhotos(user!.id)
      setPhotos(userPhotos)
      
      const usage = await getUserStorageUsage(user!.id)
      setStorageUsage(usage)
    } catch (error) {
      console.error('Error fetching photos:', error)
      toast.error('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const checkUserPlan = async () => {
    try {
      const response = await fetch(`/api/stripe/subscription?userId=${user!.id}`)
      const data = await response.json()
      const subscription = data.subscription
      
      // Free users can't upload photos
      setCanUpload(subscription.status !== 'free')
    } catch (error) {
      console.error('Error checking user plan:', error)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!canUpload) {
      toast.error('Photo uploads are only available for Family and Extended Family plans. Please upgrade to use this feature.')
      return
    }

    setUploading(true)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`)
          continue
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`)
          continue
        }

        await uploadPhoto(user!.id, file)
      }
      
      await fetchPhotos()
      toast.success('Photos uploaded successfully!')
    } catch (error) {
      console.error('Error uploading photos:', error)
      toast.error('Failed to upload photos')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return

    try {
      await deletePhoto(photoToDelete.id, user!.id)
      await fetchPhotos()
      toast.success('Photo deleted successfully')
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast.error('Failed to delete photo')
    } finally {
      setShowDeleteDialog(false)
      setPhotoToDelete(null)
    }
  }

  const handleSetProfilePhoto = async (photo: UserPhoto) => {
    try {
      await setProfilePhoto(photo.id, user!.id)
      await fetchPhotos()
      toast.success('Profile photo updated!')
    } catch (error) {
      console.error('Error setting profile photo:', error)
      toast.error('Failed to update profile photo')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatStorageUsage = () => {
    const used = formatFileSize(storageUsage.totalSize)
    const limit = formatFileSize(storageUsage.storageLimit)
    const percentage = (storageUsage.totalSize / storageUsage.storageLimit) * 100
    
    return {
      used,
      limit,
      percentage: Math.round(percentage)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heartmail-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Photo Library</h1>
          <p className="text-gray-600">Manage your photos and upload new ones</p>
        </div>

        {/* Storage Usage */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Storage Usage</h3>
              <Badge variant="outline">
                {storageUsage.totalPhotos} photos
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatStorageUsage().used} used</span>
                <span>{formatStorageUsage().limit} limit</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-heartmail-pink h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(formatStorageUsage().percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        {canUpload ? (
          <Card 
            ref={dropZoneRef}
            className="mb-8 border-2 border-dashed border-gray-300 hover:border-heartmail-pink transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <CardContent className="p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Photos</h3>
              <p className="text-gray-600 mb-4">
                Drag and drop photos here, or click to browse
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-heartmail"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Choose Photos
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo Uploads Not Available</h3>
              <p className="text-gray-600 mb-4">
                Photo uploads are only available for Family and Extended Family plans.
              </p>
              <Button 
                onClick={() => window.location.href = '/#pricing'}
                className="btn-heartmail"
              >
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Photos Yet</h3>
              <p className="text-gray-600">
                {canUpload 
                  ? "Upload your first photo to get started!"
                  : "Upgrade to Family or Extended Family plan to upload photos."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {photos.map((photo) => (
              <Card 
                key={photo.id} 
                className="group hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <CardContent className="p-2">
                  <div className="relative aspect-square">
                    <img
                      src={getPhotoUrl(photo.storage_path)}
                      alt={photo.original_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {photo.is_profile_photo && (
                      <Badge className="absolute top-2 left-2 bg-heartmail-pink">
                        <Star className="h-3 w-3 mr-1" />
                        Profile
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPhotoToDelete(photo)
                          setShowDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 truncate">{photo.original_name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(photo.file_size)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Photo Detail Modal */}
        {selectedPhoto && (
          <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
            <DialogContent 
              className="max-w-4xl"
              aria-describedby="photo-preview-description"
            >
              <div id="photo-preview-description" className="sr-only">
                Preview and manage your photo: {selectedPhoto.original_name}
              </div>
              <DialogHeader>
                <DialogTitle>{selectedPhoto.original_name}</DialogTitle>
                <DialogDescription>
                  Uploaded {new Date(selectedPhoto.created_at).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={getPhotoUrl(selectedPhoto.storage_path)}
                    alt={selectedPhoto.original_name}
                    className="max-w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
                <div className="flex justify-center space-x-4">
                  {!selectedPhoto.is_profile_photo && (
                    <Button
                      onClick={() => handleSetProfilePhoto(selectedPhoto)}
                      className="btn-heartmail"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Set as Profile Photo
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = getPhotoUrl(selectedPhoto.storage_path)
                      link.download = selectedPhoto.original_name
                      link.click()
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Photo</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this photo? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePhoto}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
