import SettingsPanel from '@/components/admin/SettingsPanel'
import { getBusinessSettings } from '@/lib/admin/queries'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const settings = await getBusinessSettings()

  return <SettingsPanel settings={settings} />
}
