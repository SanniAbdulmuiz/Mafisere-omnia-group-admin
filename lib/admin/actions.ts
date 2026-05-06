'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import type { BusinessSettings } from './queries'

export type AdminActionResult = {
  success: boolean
  message: string
}

export async function saveBusinessSettings(settings: BusinessSettings): Promise<AdminActionResult> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('business_settings')
    .upsert({
      id: 1,
      business_name: settings.business_name?.trim() || '',
      phone_1: settings.phone_1?.trim() || '',
      phone_2: settings.phone_2?.trim() || '',
      email: settings.email?.trim() || '',
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

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true, message: 'Business settings saved.' }
}
