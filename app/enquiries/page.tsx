import EnquiriesPanel from '@/components/admin/EnquiriesPanel'
import { getEnquiries } from '@/lib/admin/queries'

export const dynamic = 'force-dynamic'

export default async function EnquiriesPage() {
  const enquiries = await getEnquiries()

  return <EnquiriesPanel enquiries={enquiries} />
}
