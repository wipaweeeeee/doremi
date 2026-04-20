'use client'

import { useEffect } from 'react'
import TicketSelector from '@/components/TicketSelector'
import styles from './EventDrawer.module.scss'

export default function EventDrawer({ event, onClose }) {
  useEffect(() => {
    if (!event) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [event, onClose])


  return (
    <>
      <div
        className={`${styles.backdrop} ${event ? styles.visible : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.drawer} ${event ? styles.open : ''}`}>
        {event && (
          <>
            <button className={styles.close} onClick={onClose} aria-label="Close">
              ✕
            </button>

            {event.image_url && (
              <img src={event.image_url} alt={event.title} className={styles.image} />
            )}

            <div className={styles.body}>
              <h2 className={styles.title}>{event.title}</h2>

              <p className={styles.date}>
                {new Date(event.date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {' · '}
                {new Date(event.date).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>

              {event.description && (
                <p className={styles.description}>{event.description}</p>
              )}

              {event.bookings?.[0]?.count >= event.capacity ? (
                <p className={styles.soldOut}>Sold out</p>
              ) : (
                <TicketSelector
                  ticketTypes={event.ticket_types ?? []}
                  event={{ id: event.id, slug: event.slug, title: event.title }}
                />
              )}
            </div>
          </>
        )}
      </aside>
    </>
  )
}
