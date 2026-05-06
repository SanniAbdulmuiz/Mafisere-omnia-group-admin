import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import type { Auto, Gadget, Property } from './types'

export async function getGadgets(): Promise<Gadget[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('gadgets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAutos(): Promise<Auto[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('autos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getProperties(): Promise<Property[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('real_estate')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
