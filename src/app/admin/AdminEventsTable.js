'use client'

import { useState, useCallback } from 'react'
import EventEditDrawer from './EventEditDrawer'
import styles from './AdminEventsTable.module.scss'

export default function AdminEventsTable({ initialEvents }) {
  const [events, setEvents] = useState(initialEvents)
  const [editingEvent, setEditingEvent] = useState(null)

  const handleSaved = useCallback((updated) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)))
    setEditingEvent(null)
  }, [])

  const handleDeleted = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setEditingEvent(null)
  }, [])

  const handleClose = useCallback(() => setEditingEvent(null), [])

  if (!events?.length) return <p>No upcoming events.</p>

  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Capacity</th>
            <th>Published</th>
            <th>Bookings</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.title}</td>
              <td>{new Date(event.date).toLocaleString()}</td>
              <td>{event.capacity}</td>
              <td>{event.published ? 'Yes' : 'No'}</td>
              <td>{event.bookings[0]?.count ?? 0}</td>
              <td>
                <button className={styles.editButton} onClick={() => setEditingEvent(event)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <EventEditDrawer
        event={editingEvent}
        onClose={handleClose}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </>
  )
}
