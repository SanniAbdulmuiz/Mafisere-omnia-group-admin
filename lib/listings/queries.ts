import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import type { Auto, Gadget, Property } from './types'

export async function getGadgets(): Promise<Gadget[]> {
  // Fetch all gadget listings newest first for the gadgets admin page.
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('gadgets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  // Return an empty array instead of null so components can render safely.
  return data ?? []
}

export async function getAutos(): Promise<Auto[]> {
  // Fetch all auto listings newest first for the autos admin page.
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('autos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  // Return an empty array instead of null so components can render safely.
  return data ?? []
}

export async function getProperties(): Promise<Property[]> {
  // Fetch all real estate listings newest first for the real estate admin page.
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('real_estate')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  // Return an empty array instead of null so components can render safely.
  return data ?? []
}
