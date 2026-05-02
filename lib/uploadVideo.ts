export async function uploadVideo(file: File) {
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