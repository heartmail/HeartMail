import { supabase } from './supabase'

export interface UserPhoto {
  id: string
  user_id: string
  filename: string
  original_name: string
  file_size: number
  mime_type: string
  storage_path: string
  is_profile_photo: boolean
  created_at: string
  updated_at: string
}

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

// Get all photos for a user
export async function getUserPhotos(userId: string): Promise<UserPhoto[]> {
  const { data, error } = await supabase
    .from('user_photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Upload a photo to Supabase Storage
export async function uploadPhoto(
  userId: string,
  file: File,
  isProfilePhoto: boolean = false
): Promise<UserPhoto> {
  // Generate unique filename
  const timestamp = Date.now()
  const fileExtension = file.name.split('.').pop()
  const filename = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`
  const storagePath = `users/${userId}/photos/${filename}`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('user-photos')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) throw uploadError

  // If this is a profile photo, unset other profile photos
  if (isProfilePhoto) {
    await supabase
      .from('user_photos')
      .update({ is_profile_photo: false })
      .eq('user_id', userId)
      .eq('is_profile_photo', true)
  }

  // Save photo metadata to database
  const { data, error } = await supabase
    .from('user_photos')
    .insert({
      user_id: userId,
      filename,
      original_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      is_profile_photo: isProfilePhoto
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a photo
export async function deletePhoto(photoId: string, userId: string): Promise<void> {
  // Get photo info first
  const { data: photo, error: fetchError } = await supabase
    .from('user_photos')
    .select('storage_path')
    .eq('id', photoId)
    .eq('user_id', userId)
    .single()

  if (fetchError) throw fetchError

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('user-photos')
    .remove([photo.storage_path])

  if (storageError) throw storageError

  // Delete from database
  const { error: dbError } = await supabase
    .from('user_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', userId)

  if (dbError) throw dbError
}

// Set profile photo
export async function setProfilePhoto(photoId: string, userId: string): Promise<void> {
  // Unset current profile photo
  await supabase
    .from('user_photos')
    .update({ is_profile_photo: false })
    .eq('user_id', userId)
    .eq('is_profile_photo', true)

  // Set new profile photo
  const { error } = await supabase
    .from('user_photos')
    .update({ is_profile_photo: true })
    .eq('id', photoId)
    .eq('user_id', userId)

  if (error) throw error

  // Update user_profiles table
  const { data: photo } = await supabase
    .from('user_photos')
    .select('storage_path')
    .eq('id', photoId)
    .single()

  if (photo) {
    const avatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-photos/${photo.storage_path}`
    
    await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        avatar_url: avatarUrl,
        photo_updated_at: new Date().toISOString()
      })
  }
}

// Get photo URL from storage path
export function getPhotoUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-photos/${storagePath}`
}

// Get user's storage usage
export async function getUserStorageUsage(userId: string): Promise<{
  totalPhotos: number
  totalSize: number
  storageLimit: number
}> {
  const { data, error } = await supabase
    .from('user_photos')
    .select('file_size')
    .eq('user_id', userId)

  if (error) throw error

  const totalPhotos = data?.length || 0
  const totalSize = data?.reduce((sum, photo) => sum + photo.file_size, 0) || 0

  // Storage limits based on plan (you'll need to get user's plan)
  const storageLimit = 100 * 1024 * 1024 // 100MB default, should be based on user's plan

  return {
    totalPhotos,
    totalSize,
    storageLimit
  }
}
