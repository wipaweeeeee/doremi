import { createServiceRoleClient } from '@/lib/supabase'
import EventForm from './EventForm'
import LogoutButton from './LogoutButton'
import styles from './page.module.scss'

export default async function AdminPage() {
  const supabase = createServiceRoleClient()

  const { data: events, error } = await supabase
    .from('events')
    .select('*, bookings(count)')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })

  return (
    <main className={styles.page}>
      <LogoutButton />
      <h1>Admin</h1>

      <h2>Upcoming Events</h2>
      {error && <p>Failed to load events: {error.message}</p>}
      {!error && events?.length === 0 && <p>No upcoming events.</p>}
      {events?.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Capacity</th>
              <th>Price</th>
              <th>Bookings</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{new Date(event.date).toLocaleString()}</td>
                <td>{event.capacity}</td>
                <td>${(event.price_cents / 100).toFixed(2)}</td>
                <td>{event.bookings[0]?.count ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <EventForm />
    </main>
  )
}
