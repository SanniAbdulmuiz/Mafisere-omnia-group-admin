import ListingManager from '@/components/listings/ListingManager'
import { getProperties } from '@/lib/listings/queries'

export default async function RealEstatePage() {
  const properties = await getProperties()

  return <ListingManager kind="real-estate" initialListings={properties} />
}
