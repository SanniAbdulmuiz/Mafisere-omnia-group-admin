import { supabase } from './supabase'

export async function uploadGadgetImage(file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `${fileName}`

  const { error } = await supabase.storage
    .from('gadget-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  const { data } = supabase.storage
    .from('gadget-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}