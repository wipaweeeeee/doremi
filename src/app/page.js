import { createServiceRoleClient } from '@/lib/supabase'
import EventsGrid from '@/components/EventsGrid'
import styles from './page.module.scss'

export default async function Home() {
  const supabase = createServiceRoleClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, slug, title, description, date, capacity, image_url, ticket_types(id, name, price_cents), bookings(count)')
    .eq('published', true)
    .order('date', { ascending: true })

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Upcoming Events</h1>
      {!events?.length && <p>No events yet.</p>}
      <EventsGrid events={events} />
    </main>
  )
}
