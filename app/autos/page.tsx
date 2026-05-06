import ListingManager from '@/components/listings/ListingManager'
import { getAutos } from '@/lib/listings/queries'

export default async function AutosPage() {
  const autos = await getAutos()

  return <ListingManager kind="autos" initialListings={autos} />
}
