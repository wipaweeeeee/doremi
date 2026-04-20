'use client'

import { useState, useEffect } from 'react'
import styles from './EventEditDrawer.module.scss'

export default function EventEditDrawer({ event, onClose, onSaved, onDeleted }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [capacity, setCapacity] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!event) return
    setTitle(event.title ?? '')
    setSlug(event.slug ?? '')
    setDescription(event.description ?? '')
    setDate(event.date ? event.date.slice(0, 16) : '')
    setCapacity(event.capacity ?? '')
    setImageUrl(event.image_url ?? '')
    setPublished(event.published ?? false)
    setError(null)
    setConfirmDelete(false)
  }, [event])

  useEffect(() => {
    if (!event) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [event, onClose])

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        description,
        date,
        capacity: parseInt(capacity, 10),
        image_url: imageUrl || null,
        published,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    onSaved(data)
  }

  async function handleDelete() {
    setDeleting(true)
    setError(null)

    const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Delete failed')
      setDeleting(false)
      return
    }

    onDeleted(event.id)
  }

  return (
    <>
      <div
        className={`${styles.backdrop} ${event ? styles.visible : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.drawer} ${event ? styles.open : ''}`}>
        {event && (
          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.header}>
              <h2 className={styles.heading}>Edit Event</h2>
              <button type="button" className={styles.close} onClick={onClose} aria-label="Close">✕</button>
            </div>

            <label className={styles.field}>
              Title
              <input className={styles.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>

            <label className={styles.field}>
              Slug
              <input className={styles.input} type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </label>

            <label className={styles.field}>
              Description
              <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>

            <label className={styles.field}>
              Date
              <input className={styles.input} type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>

            <label className={styles.field}>
              Capacity
              <input className={styles.input} type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
            </label>

            <label className={styles.field}>
              Image URL
              <input className={styles.input} type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </label>

            <label className={styles.checkboxField}>
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              Published
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button type="button" className={styles.cancelButton} onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>

            <div className={styles.deleteSection}>
              {!confirmDelete ? (
                <button type="button" className={styles.deleteButton} onClick={() => setConfirmDelete(true)}>
                  Delete event
                </button>
              ) : (
                <div className={styles.confirmDelete}>
                  <p>Are you sure? This cannot be undone.</p>
                  <div className={styles.confirmActions}>
                    <button type="button" className={styles.cancelButton} onClick={() => setConfirmDelete(false)} disabled={deleting}>
                      No, keep it
                    </button>
                    <button type="button" className={styles.deleteConfirmButton} onClick={handleDelete} disabled={deleting}>
                      {deleting ? 'Deleting…' : 'Yes, delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        )}
      </aside>
    </>
  )
}
