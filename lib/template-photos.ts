import { supabase } from './supabase'

export interface TemplatePhoto {
  id: string
  template_id: string
  photo_id: string
  position: {
    x: number
    y: number
    width: number
    height: number
    rotation?: number
  }
  z_index: number
  created_at: string
}

// Add photo to template
export async function addPhotoToTemplate(
  templateId: string,
  photoId: string,
  position: { x: number; y: number; width: number; height: number; rotation?: number },
  zIndex: number = 0
): Promise<TemplatePhoto> {
  const { data, error } = await supabase
    .from('template_photos')
    .insert({
      template_id: templateId,
      photo_id: photoId,
      position,
      z_index: zIndex
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get photos for a template
export async function getTemplatePhotos(templateId: string): Promise<TemplatePhoto[]> {
  const { data, error } = await supabase
    .from('template_photos')
    .select(`
      *,
      user_photos!inner(
        id,
        filename,
        original_name,
        storage_path,
        mime_type
      )
    `)
    .eq('template_id', templateId)
    .order('z_index', { ascending: true })

  if (error) throw error
  return data || []
}

// Update photo position in template
export async function updateTemplatePhotoPosition(
  templatePhotoId: string,
  position: { x: number; y: number; width: number; height: number; rotation?: number },
  zIndex?: number
): Promise<void> {
  const updateData: any = { position }
  if (zIndex !== undefined) updateData.z_index = zIndex

  const { error } = await supabase
    .from('template_photos')
    .update(updateData)
    .eq('id', templatePhotoId)

  if (error) throw error
}

// Remove photo from template
export async function removePhotoFromTemplate(templatePhotoId: string): Promise<void> {
  const { error } = await supabase
    .from('template_photos')
    .delete()
    .eq('id', templatePhotoId)

  if (error) throw error
}

// Get photo URL for template photo
export function getTemplatePhotoUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-photos/${storagePath}`
}
