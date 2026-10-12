import { createServiceRoleClient } from '@/lib/supabase'
import AdminEventsTable from './AdminEventsTable'
import AdminCreateModal from './AdminCreateModal'
import LogoutButton from './LogoutButton'
import styles from './page.module.scss'

export default async function AdminPage() {
  const supabase = createServiceRoleClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*, bookings(count)')
    .order('date', { ascending: false })

  return (
    <main className={styles.page}>
      <LogoutButton />
      <h1>Admin</h1>

      <h2>All Events</h2>
      {error && <p>Failed to load events: {error.message}</p>}
      {!error && <AdminEventsTable initialEvents={events ?? []} />}

      <AdminCreateModal />
    </main>
  )
}
