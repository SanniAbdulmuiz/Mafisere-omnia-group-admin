import { supabase } from './supabase'

export async function uploadGadgetImage(file: File) {
  // Create a mostly unique filename so uploads do not overwrite each other.
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `${fileName}`

  // Store the image in the public gadget image bucket.
  const { error } = await supabase.storage
    .from('gadget-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  // Convert the storage path into a URL that can be saved with the listing.
  const { data } = supabase.storage
    .from('gadget-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}
