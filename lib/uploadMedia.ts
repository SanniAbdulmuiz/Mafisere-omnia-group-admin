import { supabase } from './supabase'

export async function uploadImage(file: File) {
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

export async function uploadVideoToCloudinary(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
    { method: 'POST', body: formData }
  )
  
  const cloudData = await cloudRes.json()
  
  if (cloudData.error) {
    throw new Error(cloudData.error.message)
  }

  return {
    url: cloudData.secure_url,
    public_id: cloudData.public_id,
    duration: Math.round(cloudData.duration || 0),
    format: cloudData.format
  }
}

export async function saveVideoRecord(videoData: {
  url: string
  public_id: string
  duration: number
  format: string
  category: string
  name: string
}) {
  const { error } = await supabase.from('videos').insert([{
    url: videoData.url,
    public_id: videoData.public_id,
    duration: videoData.duration,
    format: videoData.format,
    category: videoData.category,
    gadget_name: videoData.name
  }])

  if (error) throw error
}

export interface UploadProgress {
  current: number
  total: number
  message: string
}

export async function uploadMultipleImages(
  files: File[], 
  onProgress?: (progress: UploadProgress) => void
): Promise<string[]> {
  const imageUrls: string[] = []
  
  for (let i = 0; i < files.length; i++) {
    onProgress?.({
      current: i + 1,
      total: files.length,
      message: `Uploading image ${i + 1} of ${files.length}...`
    })
    const url = await uploadImage(files[i])
    imageUrls.push(url)
  }
  
  return imageUrls
}

export async function handleGadgetUpload(
  form: {
    name: string
    category: string
    condition: string
    storage: string
    price: string
    description: string
  },
  images: File[],
  video: File | null,
  onProgress?: (message: string) => void
) {
  let imageUrls: string[] = []
  
  if (images.length > 0) {
    onProgress?.('Uploading images...')
    imageUrls = await uploadMultipleImages(images)
  }

  let videoData: { url: string; public_id: string; duration: number; format: string } | null = null
  if (video) {
    onProgress?.('Uploading video to Cloudinary...')
    videoData = await uploadVideoToCloudinary(video)
    
    onProgress?.('Saving video record...')
    await saveVideoRecord({
      url: videoData.url,
      public_id: videoData.public_id,
      duration: videoData.duration,
      format: videoData.format,
      category: 'gadget',
      name: form.name
    })
  }

  onProgress?.('Saving gadget to database...')
  const { error } = await supabase.from('gadgets').insert([{
    name: form.name.trim(),
    category: form.category.toLowerCase(),
    condition: form.condition.charAt(0).toUpperCase() + form.condition.slice(1),
    storage: form.storage || null,
    price: parseFloat(form.price),
    description: form.description || null,
    images: imageUrls,
    video_url: videoData?.url || null,
    is_available: true
  }])

  if (error) throw error
  
  onProgress?.('')
}