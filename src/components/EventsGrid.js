'use client'

import { useState, useCallback } from 'react'
import EventDrawer from '@/components/EventDrawer'
import styles from './EventsGrid.module.scss'

export default function EventsGrid({ events }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const close = useCallback(() => setSelectedEvent(null), [])

  return (
    <>
      <div className={styles.grid}>
        {events?.map((event) => (
          <button
            key={event.id}
            className={styles.card}
            onClick={() => setSelectedEvent(event)}
          >
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
            </div>
          </button>
        ))}
      </div>

      <EventDrawer event={selectedEvent} onClose={close} />
    </>
  )
}
