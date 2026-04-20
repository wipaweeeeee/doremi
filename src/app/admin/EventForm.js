'use client'

import { useState, useEffect } from 'react'
import styles from './EventForm.module.scss'

const defaultTicketType = () => ({ name: 'Standard', price: '25', capacity: '' })

export default function EventForm({ onSuccess } = {}) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
const [capacity, setCapacity] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [published, setPublished] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const [ticketTypes, setTicketTypes] = useState([defaultTicketType()])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!slugTouched) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      )
    }
  }, [title, slugTouched])

  function updateTicketType(index, field, value) {
    setTicketTypes((prev) =>
      prev.map((tt, i) => (i === index ? { ...tt, [field]: value } : tt))
    )
  }

  function addTicketType() {
    setTicketTypes((prev) => [...prev, { name: 'Standard', price: '25', capacity: '' }])
  }

  function handleTicketNameChange(index, name) {
    setTicketTypes((prev) =>
      prev.map((tt, i) =>
        i === index
          ? { ...tt, name, price: name === 'Free' ? '0' : tt.price === '0' ? '25' : tt.price }
          : tt
      )
    )
  }

  function removeTicketType(index) {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        description,
        date,
        capacity: parseInt(capacity, 10),
        image_url: imageUrl || null,
        published,
        ticketTypes: ticketTypes.map((tt) => ({
          name: tt.name,
          description: '',
          price_cents: Math.round(parseFloat(tt.price || '0') * 100),
          capacity: tt.capacity ? parseInt(tt.capacity, 10) : null,
        })),
      }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      setError(error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Create Event</h2>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Event Details</h3>

        <label className={styles.field}>
          Title
          <input
            className={styles.input}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Slug
          <input
            className={styles.input}
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
            required
          />
        </label>

        <label className={styles.field}>
          Description
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          Date
          <input
            className={styles.input}
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

<label className={styles.field}>
          Total Capacity
          <input
            className={styles.input}
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          Image URL
          <input
            className={styles.input}
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>

        <label className={styles.checkboxField}>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ticket Types</h3>

        {ticketTypes.map((tt, i) => (
          <div key={i} className={styles.ticketRow}>
            <label className={styles.field}>
              Type
              <select
                className={styles.input}
                value={tt.name}
                onChange={(e) => handleTicketNameChange(i, e.target.value)}
              >
                <option value="Standard">Standard</option>
                <option value="Free">Free</option>
              </select>
            </label>

            <label className={styles.field}>
              Price ($)
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={tt.price}
                onChange={(e) => updateTicketType(i, 'price', e.target.value)}
                required
              />
              {parseFloat(tt.price || '0') === 0 && (
                <span className={styles.freeNote}>Free — no payment required</span>
              )}
            </label>

            <label className={styles.field}>
              Capacity limit (optional)
              <input
                className={styles.input}
                type="number"
                min="1"
                value={tt.capacity}
                onChange={(e) => updateTicketType(i, 'capacity', e.target.value)}
              />
            </label>

            {i > 0 && (
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeTicketType(i)}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button type="button" className={styles.addButton} onClick={addTicketType}>
          + Add ticket type
        </button>
      </section>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>Event added</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating…' : 'Create Event'}
      </button>
    </form>
  )
}
