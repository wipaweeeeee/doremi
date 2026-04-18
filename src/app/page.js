import { createServiceRoleClient } from '@/lib/supabase'
import styles from './page.module.scss'

export default async function Home() {
  const supabase = createServiceRoleClient()

  const { data: events } = await supabase
    .from('events')
    .select('id, slug, title, description, date, capacity, price_cents, image_url')
    .eq('published', true)
    .order('date', { ascending: true })

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Upcoming Events</h1>

      {!events?.length && <p>No events yet.</p>}

      <div className={styles.grid}>
        {events?.map((event) => (
          <a key={event.id} href={`/events/${event.slug}`} className={styles.card}>
            {event.image_url && (
              <img src={event.image_url} alt={event.title} className={styles.image} />
            )}
            <div className={styles.body}>
              <h2 className={styles.title}>{event.title}</h2>
              <p className={styles.date}>
                {new Date(event.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              {event.description && (
                <p className={styles.description}>{event.description}</p>
              )}
              <p className={styles.price}>
                {event.price_cents === 0
                  ? 'Free'
                  : `$${(event.price_cents / 100).toFixed(2)}`}
              </p>
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}
