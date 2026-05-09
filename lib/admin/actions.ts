'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import type { BusinessSettings } from './queries'

// Standard response shape returned to client components after admin mutations.
export type AdminActionResult = {
  success: boolean
  message: string
}

export async function saveBusinessSettings(settings: BusinessSettings): Promise<AdminActionResult> {
  // Normalize the email before validation and saving.
  const email = settings.email?.trim() || ''

  // Business name is the minimum required setting.
  if (!settings.business_name?.trim()) {
    return { success: false, message: 'Business name is required.' }
  }

  // Only validate email format when an email was entered.
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: 'Enter a valid business email.' }
  }

  // Upsert keeps one settings row, creating it if id 1 does not exist yet.
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('business_settings')
    .upsert({
      id: 1,
      business_name: settings.business_name?.trim() || '',
      phone_1: settings.phone_1?.trim() || '',
      phone_2: settings.phone_2?.trim() || '',
      email,
      address: settings.address?.trim() || '',
      show_enquiry_button: Boolean(settings.show_enquiry_button),
      whatsapp_chat_widget: Boolean(settings.whatsapp_chat_widget),
      show_sold_items: Boolean(settings.show_sold_items),
      maintenance_mode: Boolean(settings.maintenance_mode),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (error) {
    return { success: false, message: error.message }
  }

  // Refresh settings and dashboard pages so they show the saved values.
  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true, message: 'Business settings saved.' }
}
