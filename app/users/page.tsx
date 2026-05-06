import UsersPanel from '@/components/admin/UsersPanel'
import { getAdminUsers } from '@/lib/admin/queries'

export default async function UsersPage() {
  const users = await getAdminUsers()

  return <UsersPanel initialUsers={users} />
}
