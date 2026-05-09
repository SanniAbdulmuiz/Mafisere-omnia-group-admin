import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

// Admin user row shape used by the admin/settings UI.
export type AdminUser = {
  id: string
  full_name: string
  email: string
  role: string
  status: string
}

// Enquiry row shape used for recent customer messages.
export type Enquiry = {
  id: string
  name: string
  created_at: string
  product_name: string | null
  message: string
}

// Business settings are optional because the settings row may not exist yet.
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
  // Fetch admin users alphabetically for display in settings/admin screens.
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, full_name, email, role, status')
    .order('full_name', { ascending: true })

  // Admin dashboard should still render if this optional query fails.
  if (error) return []
  return data ?? []
}

export async function getEnquiries(): Promise<Enquiry[]> {
  // Fetch the latest customer enquiries shown in the admin dashboard.
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('enquiries')
    .select('id, name, created_at, product_name, message')
    .order('created_at', { ascending: false })
    .limit(50)

  // Return an empty list on failure so the UI can show no enquiries instead of crashing.
  if (error) return []
  return data ?? []
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  // The app stores one business settings row with id 1.
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .eq('id', 1)
    .limit(1)
    .maybeSingle()

  // If the row does not exist yet, callers receive an empty settings object.
  if (error || !data) return {}
  return data
}
