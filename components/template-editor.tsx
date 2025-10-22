'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Image as ImageIcon, 
  Upload, 
  X, 
  Move, 
  RotateCw,
  Trash2,
  Plus
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { getUserPhotos, getPhotoUrl, UserPhoto } from '@/lib/photo-library'
import { 
  getTemplatePhotos, 
  addPhotoToTemplate, 
  removePhotoFromTemplate,
  getTemplatePhotoUrl,
  TemplatePhoto 
} from '@/lib/template-photos'
import { toast } from 'sonner'

interface TemplateEditorProps {
  templateId: string
  onSave?: () => void
}

export default function TemplateEditor({ templateId, onSave }: TemplateEditorProps) {
  const [photos, setPhotos] = useState<UserPhoto[]>([])
  const [templatePhotos, setTemplatePhotos] = useState<TemplatePhoto[]>([])
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<UserPhoto | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchPhotos()
      fetchTemplatePhotos()
    }
  }, [user, templateId])

  const fetchPhotos = async () => {
    try {
      const userPhotos = await getUserPhotos(user!.id)
      setPhotos(userPhotos)
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  const fetchTemplatePhotos = async () => {
    try {
      const photos = await getTemplatePhotos(templateId)
      setTemplatePhotos(photos)
    } catch (error) {
      console.error('Error fetching template photos:', error)
    }
  }

  const handleAddPhoto = async (photo: UserPhoto) => {
    try {
      await addPhotoToTemplate(templateId, photo.id, {
        x: 50,
        y: 50,
        width: 200,
        height: 200
      })
      await fetchTemplatePhotos()
      setShowPhotoLibrary(false)
      toast.success('Photo added to template!')
    } catch (error) {
      console.error('Error adding photo to template:', error)
      toast.error('Failed to add photo to template')
    }
  }

  const handleRemovePhoto = async (templatePhotoId: string) => {
    try {
      await removePhotoFromTemplate(templatePhotoId)
      await fetchTemplatePhotos()
      toast.success('Photo removed from template!')
    } catch (error) {
      console.error('Error removing photo from template:', error)
      toast.error('Failed to remove photo from template')
    }
  }

  const handleMouseDown = (e: React.MouseEvent, templatePhoto: TemplatePhoto) => {
    e.preventDefault()
    setIsDragging(true)
    setSelectedPhoto(templatePhoto as any)
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - templatePhoto.position.x,
        y: e.clientY - templatePhoto.position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedPhoto) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      
      // Update position in real-time (you might want to debounce this)
      setTemplatePhotos(prev => 
        prev.map(tp => 
          tp.id === selectedPhoto.id 
            ? { ...tp, position: { ...tp.position, x: newX, y: newY } }
            : tp
        )
      )
    }
  }

  const handleMouseUp = async () => {
    if (!isDragging || !selectedPhoto) return

    setIsDragging(false)
    setSelectedPhoto(null)

    // Save final position to database
    try {
      const finalPhoto = templatePhotos.find(tp => tp.id === selectedPhoto.id)
      if (finalPhoto) {
        await updateTemplatePhotoPosition(
          selectedPhoto.id,
          finalPhoto.position,
          finalPhoto.z_index
        )
      }
    } catch (error) {
      console.error('Error updating photo position:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Canvas */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Template Editor</h3>
            <Button
              onClick={() => setShowPhotoLibrary(true)}
              className="btn-heartmail"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </div>
          
          <div 
            ref={canvasRef}
            className="relative min-h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {templatePhotos.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>No photos added yet</p>
                  <p className="text-sm">Click "Add Photo" to get started</p>
                </div>
              </div>
            ) : (
              templatePhotos.map((templatePhoto) => (
                <div
                  key={templatePhoto.id}
                  className="absolute cursor-move group"
                  style={{
                    left: templatePhoto.position.x,
                    top: templatePhoto.position.y,
                    width: templatePhoto.position.width,
                    height: templatePhoto.position.height,
                    zIndex: templatePhoto.z_index
                  }}
                  onMouseDown={(e) => handleMouseDown(e, templatePhoto)}
                >
                  <img
                    src={templatePhoto.user_photos ? getTemplatePhotoUrl(templatePhoto.user_photos.storage_path) : ''}
                    alt={templatePhoto.user_photos?.original_name || 'Template photo'}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                    style={{
                      transform: `rotate(${templatePhoto.position.rotation || 0}deg)`
                    }}
                  />
                  
                  {/* Photo Controls */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemovePhoto(templatePhoto.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo Library Modal */}
      <Dialog open={showPhotoLibrary} onOpenChange={setShowPhotoLibrary}>
        <DialogContent 
          className="max-w-4xl"
          aria-describedby="photo-library-description"
        >
          <div id="photo-library-description" className="sr-only">
            Select a photo from your library to add to your template.
          </div>
          <DialogHeader>
            <DialogTitle>Add Photo to Template</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {photos.map((photo) => (
              <Card 
                key={photo.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleAddPhoto(photo)}
              >
                <CardContent className="p-2">
                  <div className="aspect-square">
                    <img
                      src={getPhotoUrl(photo.storage_path)}
                      alt={photo.original_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-600 truncate mt-2">
                    {photo.original_name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {photos.length === 0 && (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No photos available</p>
              <p className="text-sm text-gray-500">Upload photos to your library first</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Helper function to update photo position (you'll need to implement this)
async function updateTemplatePhotoPosition(
  templatePhotoId: string,
  position: { x: number; y: number; width: number; height: number; rotation?: number },
  zIndex: number
): Promise<void> {
  // Implementation would go here
  console.log('Updating photo position:', { templatePhotoId, position, zIndex })
}
