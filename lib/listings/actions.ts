'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import type { ActionResult, ListingFormValues, ListingKind, SaveListingPayload, UploadedVideo } from './types'

const routeByKind: Record<ListingKind, string> = {
  gadgets: '/gadgets',
  autos: '/autos',
  'real-estate': '/real-estate',
}

const tableByKind: Record<ListingKind, string> = {
  gadgets: 'gadgets',
  autos: 'autos',
  'real-estate': 'real_estate',
}

function nullable(value: string | undefined) {
  const clean = value?.trim()
  return clean ? clean : null
}

function numberOrNull(value: string | undefined) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function price(value: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('Enter a valid price.')
  }
  return parsed
}

function withMedia(
  values: Record<string, unknown>,
  payload: SaveListingPayload,
  editing: boolean
) {
  const update = { ...values }

  if (!editing || payload.imageUrls?.length) {
    update.images = payload.imageUrls ?? []
  }

  if (!editing || payload.video) {
    update.video_url = payload.video?.url ?? null
  }

  return update
}

async function saveVideoRecord(video: UploadedVideo, values: ListingFormValues, kind: ListingKind) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('videos').insert([{
    url: video.url,
    public_id: video.public_id,
    duration: video.duration,
    format: video.format,
    category: kind === 'real-estate' ? 'real_estate' : kind.slice(0, -1),
    gadget_name: values.name.trim(),
  }])

  if (error) throw error
}

function buildListingRecord(kind: ListingKind, payload: SaveListingPayload, editing: boolean) {
  const values = payload.values
  const base = {
    name: values.name.trim(),
    price: price(values.price),
    description: nullable(values.description),
  }

  if (!base.name) throw new Error('Name is required.')

  if (kind === 'gadgets') {
    return withMedia({
      ...base,
      category: (values.category || 'iphone').toLowerCase(),
      condition: values.condition
        ? values.condition.charAt(0).toUpperCase() + values.condition.slice(1)
        : 'New',
      storage: nullable(values.storage),
    }, payload, editing)
  }

  if (kind === 'autos') {
    if (!values.make?.trim()) throw new Error('Make is required.')

    return withMedia({
      ...base,
      make: values.make.trim(),
      model: nullable(values.model),
      year: numberOrNull(values.year),
      condition: values.condition || 'Foreign',
      mileage: nullable(values.mileage),
    }, payload, editing)
  }

  if (!values.location?.trim()) throw new Error('Location is required.')

  return withMedia({
    ...base,
    type: values.type || 'House',
    location: values.location.trim(),
    bedrooms: numberOrNull(values.bedrooms),
  }, payload, editing)
}

export async function saveListing(
  kind: ListingKind,
  payload: SaveListingPayload,
  id?: number
): Promise<ActionResult> {
  try {
    const supabase = getSupabaseAdmin()
    const editing = Boolean(id)
    const record = buildListingRecord(kind, payload, editing)
    const table = tableByKind[kind]

    const { error } = editing
      ? await supabase.from(table).update(record).eq('id', id)
      : await supabase.from(table).insert([{ ...record, is_available: true }])

    if (error) throw error
    if (payload.video) await saveVideoRecord(payload.video, payload.values, kind)

    revalidatePath(routeByKind[kind])
    revalidatePath('/dashboard')

    return {
      success: true,
      message: editing ? 'Listing updated successfully.' : 'Listing created successfully.',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to save listing.',
    }
  }
}

export async function toggleListingStatus(
  kind: ListingKind,
  id: number,
  isAvailable: boolean
): Promise<ActionResult> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from(tableByKind[kind])
    .update({ is_available: !isAvailable })
    .eq('id', id)

  if (error) return { success: false, message: error.message }

  revalidatePath(routeByKind[kind])
  revalidatePath('/dashboard')
  return { success: true, message: 'Listing status updated.' }
}

export async function deleteListing(kind: ListingKind, id: number): Promise<ActionResult> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from(tableByKind[kind])
    .delete()
    .eq('id', id)

  if (error) return { success: false, message: error.message }

  revalidatePath(routeByKind[kind])
  revalidatePath('/dashboard')
  return { success: true, message: 'Listing deleted.' }
}
