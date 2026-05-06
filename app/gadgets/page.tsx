import ListingManager from '@/components/listings/ListingManager'
import { getGadgets } from '@/lib/listings/queries'

export default async function GadgetsPage() {
  const gadgets = await getGadgets()

  return <ListingManager kind="gadgets" initialListings={gadgets} />
}
