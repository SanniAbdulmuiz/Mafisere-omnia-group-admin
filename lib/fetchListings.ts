import { supabase } from './supabase'

type Listing = {
  id: string
  name: string
  category: string
  price: number
  is_available: boolean
  created_at: string
  type: 'gadget' | 'auto' | 'real_estate'
}

export async function getRecentListings(limit = 4) {
  const [gadgets, autos, realEstate] = await Promise.all([
    supabase.from('gadgets').select('id, name, category, price, is_available, created_at').order('created_at', { ascending: false }).limit(limit),
    supabase.from('autos').select('id, name, category, price, is_available, created_at').order('created_at', { ascending: false }).limit(limit),
    supabase.from('real_estate').select('id, name, category, price, is_available, created_at').order('created_at', { ascending: false }).limit(limit)
  ])

  const allListings: Listing[] = [
    ...(gadgets.data || []).map(g => ({ ...g, type: 'gadget' as const })),
    ...(autos.data || []).map(a => ({ ...a, type: 'auto' as const })),
    ...(realEstate.data || []).map(r => ({ ...r, type: 'real_estate' as const }))
  ]

  const sorted = allListings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)

  return sorted
}

export async function getListingStats() {
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