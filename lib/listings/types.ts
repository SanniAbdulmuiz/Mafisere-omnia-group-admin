// The three categories supported by the shared ListingManager component.
export type ListingKind = 'gadgets' | 'autos' | 'real-estate'

// Common availability field shared by all listing tables.
export type ListingStatus = {
  is_available: boolean
}

// Database shape for rows from the gadgets table.
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

// Database shape for rows from the autos table.
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

// Database shape for rows from the real_estate table.
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

// Union type used anywhere code can receive any kind of listing.
export type ListingRecord = Gadget | Auto | Property

// Shared form state shape. Some fields are only used by certain listing kinds.
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

// Cloudinary video metadata saved after upload.
export type UploadedVideo = {
  url: string
  public_id: string
  duration: number
  format: string
}

// Payload sent from the client form to the saveListing server action.
export type SaveListingPayload = {
  values: ListingFormValues
  imageUrls?: string[]
  video?: UploadedVideo | null
}

// Standard response shape returned by listing server actions.
export type ActionResult = {
  success: boolean
  message: string
}
