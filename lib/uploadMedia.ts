import { supabase } from './supabase'

export async function uploadImage(file: File) {
  // Create a unique storage filename using the original extension.
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `${fileName}`

  // Gadget images go into the gadget-images Supabase storage bucket.
  const { error } = await supabase.storage
    .from('gadget-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  // Return the public URL so it can be saved in the listing record.
  const { data } = supabase.storage
    .from('gadget-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function uploadAutoImage(file: File) {
  // Autos have their own storage bucket so media stays organized by category.
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `${fileName}`

  const { error } = await supabase.storage
    .from('auto-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  const { data } = supabase.storage
    .from('auto-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function uploadPropertyImage(file: File) {
  // Real estate images are stored separately from gadgets and autos.
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `${fileName}`

  const { error } = await supabase.storage
    .from('property-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  const { data } = supabase.storage
    .from('property-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function uploadVideoToCloudinary(file: File, onProgress?: (percent: number) => void): Promise<{
  url: string
  public_id: string
  duration: number
  format: string
}> {
  // XMLHttpRequest is used instead of fetch because it exposes upload progress events.
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        // Report whole-number progress back to the component for the progress bar.
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        // Successful Cloudinary response contains the final URL and video metadata.
        const cloudData = JSON.parse(xhr.responseText)
        resolve({
          url: cloudData.secure_url,
          public_id: cloudData.public_id,
          duration: Math.round(cloudData.duration || 0),
          format: cloudData.format
        })
      } else {
        // Cloudinary returns useful error messages in the JSON response body.
        const cloudData = JSON.parse(xhr.responseText)
        reject(new Error(cloudData.error?.message || 'Upload failed'))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`)
    xhr.send(formData)
  })
}

// Optional progress shape for callers that want per-image upload status.
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
  
  // Upload sequentially so progress is simple and storage calls are not all fired at once.
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

export async function uploadMultipleAutoImages(files: File[]): Promise<string[]> {
  // Return the public URLs for all uploaded auto images.
  const imageUrls: string[] = []
  for (const file of files) {
    const url = await uploadAutoImage(file)
    imageUrls.push(url)
  }
  return imageUrls
}

export async function uploadMultiplePropertyImages(files: File[]): Promise<string[]> {
  // Return the public URLs for all uploaded property images.
  const imageUrls: string[] = []
  for (const file of files) {
    const url = await uploadPropertyImage(file)
    imageUrls.push(url)
  }
  return imageUrls
}
