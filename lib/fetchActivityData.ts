import { supabase } from './supabase'

export async function getActivityData() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const result: { day: string; gadgets: number; autos: number; realEstate: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const startOfDay = new Date(date.setHours(0, 0, 0, 0)).toISOString()
    const endOfDay = new Date(date.setHours(23, 59, 59, 999)).toISOString()
    const dayName = days[date.getDay()]

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

    result.push({
      day: dayName,
      gadgets: gadgets || 0,
      autos: autos || 0,
      realEstate: realEstate || 0
    })
  }

  return result
}