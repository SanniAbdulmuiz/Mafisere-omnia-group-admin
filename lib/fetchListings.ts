import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type Listing = {
  id: string
  name: string
  category: string
  price: number
  is_available: boolean
  created_at: string
  type: 'gadget' | 'auto' | 'real_estate'
}

function getTimestamp(value: string) {
  const hasTimezone = /(?:z|[+-]\d{2}:\d{2})$/i.test(value)
  return new Date(hasTimezone ? value : `${value}Z`).getTime()
}

export async function getRecentListings(limit = 4) {
  const supabase = getSupabaseAdmin()
  const [gadgets, autos, realEstate] = await Promise.all([
    supabase.from('gadgets').select('id, name, category, price, is_available, created_at').order('created_at', { ascending: false }).limit(limit),
    supabase.from('autos').select('id, name, make, price, is_available, created_at').order('created_at', { ascending: false }).limit(limit),
    supabase.from('real_estate').select('id, name, type, price, is_available, created_at').order('created_at', { ascending: false }).limit(limit)
  ])

  const allListings: Listing[] = [
    ...(gadgets.data || []).map(g => ({
      ...g,
      id: String(g.id),
      category: g.category,
      type: 'gadget' as const
    })),
    ...(autos.data || []).map(a => ({
      ...a,
      id: String(a.id),
      category: a.make,
      type: 'auto' as const
    })),
    ...(realEstate.data || []).map(r => ({
      ...r,
      id: String(r.id),
      category: r.type,
      type: 'real_estate' as const
    }))
  ]

  const sorted = allListings
    .sort((a, b) => getTimestamp(b.created_at) - getTimestamp(a.created_at))
    .slice(0, limit)

  return sorted
}

export async function getListingStats() {
  const supabase = getSupabaseAdmin()
  const [gadgets, autos, realEstate] = await Promise.all([
    supabase.from('gadgets').select('id, is_available'),
    supabase.from('autos').select('id, is_available'),
    supabase.from('real_estate').select('id, is_available')
  ])

  const gadgetsCount = gadgets.data?.length || 0
  const gadgetsAvailable = gadgets.data?.filter(g => g.is_available).length || 0
  const autosCount = autos.data?.length || 0
  const autosAvailable = autos.data?.filter(a => a.is_available).length || 0
  const estateCount = realEstate.data?.length || 0
  const estateAvailable = realEstate.data?.filter(r => r.is_available).length || 0

  return {
    total: gadgetsCount + autosCount + estateCount,
    gadgets: gadgetsCount,
    gadgetsAvailable,
    autos: autosCount,
    autosAvailable,
    realEstate: estateCount,
    realEstateAvailable: estateAvailable
  }
}
