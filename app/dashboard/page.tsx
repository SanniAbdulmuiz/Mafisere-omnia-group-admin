import DashboardClient from '@/components/dashboard/DashboardClient'
import { getActivityData } from '@/lib/fetchActivityData'
import { getListingStats, getRecentListings } from '@/lib/fetchListings'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const [listings, stats, activityData] = await Promise.all([
    getRecentListings(4),
    getListingStats(),
    getActivityData(),
  ])

  return <DashboardClient listings={listings} stats={stats} activityData={activityData} />
}
