import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function getActivityData() {
  // Server-side Supabase client used to count records across all listing tables.
  const supabase = getSupabaseAdmin()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const result: { day: string; gadgets: number; autos: number; realEstate: number }[] = []

  // Build chart data for the last 7 days, oldest day first.
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Count records created within this specific calendar day.
    const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString()
    const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString()
    const dayName = days[date.getDay()]

    // head: true asks Supabase for only the count, not the actual rows.
    const { count: gadgets } = await supabase
      .from('gadgets')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    const { count: autos } = await supabase
      .from('autos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    const { count: realEstate } = await supabase
      .from('real_estate')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    // Keep the chart data shape consistent even when a count comes back as null.
    result.push({
      day: dayName,
      gadgets: gadgets || 0,
      autos: autos || 0,
      realEstate: realEstate || 0
    })
  }

  return result
}
