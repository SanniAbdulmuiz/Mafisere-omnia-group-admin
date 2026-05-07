import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export type AdminUser = {
  id: string
  full_name: string
  email: string
  role: string
  status: string
}

export type Enquiry = {
  id: string
  name: string
  created_at: string
  product_name: string | null
  message: string
}

export type BusinessSettings = {
  id?: number
  business_name?: string
  phone_1?: string
  phone_2?: string
  email?: string
  address?: string
  show_enquiry_button?: boolean
  whatsapp_chat_widget?: boolean
  show_sold_items?: boolean
  maintenance_mode?: boolean
  updated_at?: string
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, full_name, email, role, status')
    .order('full_name', { ascending: true })

  if (error) return []
  return data ?? []
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('enquiries')
    .select('id, name, created_at, product_name, message')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return []
  return data ?? []
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .eq('id', 1)
    .limit(1)
    .maybeSingle()

  if (error || !data) return {}
  return data
}
