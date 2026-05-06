export type ListingKind = 'gadgets' | 'autos' | 'real-estate'

export type ListingStatus = {
  is_available: boolean
}

export type Gadget = ListingStatus & {
  id: number
  name: string
  category: string
  condition: string
  storage: string | null
  price: number
  description: string | null
  images: string[]
  video_url: string | null
  created_at?: string
}

export type Auto = ListingStatus & {
  id: number
  name: string
  make: string
  model: string | null
  year: number | null
  condition: string
  mileage: string | null
  price: number
  description: string | null
  images: string[]
  video_url: string | null
  created_at?: string
}

export type Property = ListingStatus & {
  id: number
  name: string
  type: string
  location: string
  bedrooms: number | null
  price: number
  description: string | null
  images: string[]
  video_url: string | null
  created_at?: string
}

export type ListingRecord = Gadget | Auto | Property

export type ListingFormValues = {
  name: string
  category?: string
  condition?: string
  storage?: string
  make?: string
  model?: string
  year?: string
  mileage?: string
  type?: string
  location?: string
  bedrooms?: string
  price: string
  description: string
}

export type UploadedVideo = {
  url: string
  public_id: string
  duration: number
  format: string
}

export type SaveListingPayload = {
  values: ListingFormValues
  imageUrls?: string[]
  video?: UploadedVideo | null
}

export type ActionResult = {
  success: boolean
  message: string
}
