'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './EventForm.module.scss'

export default function EventForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [capacity, setCapacity] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

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
        price_cents: Math.round(parseFloat(price) * 100),
        image_url: imageUrl,
      }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      setError(error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    setTitle('')
    setSlug('')
    setDescription('')
    setDate('')
    setCapacity('')
    setPrice('')
    setImageUrl('')
    setSlugTouched(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Create Event</h2>

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
        Capacity
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
        Price ($)
        <input
          className={styles.input}
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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

      {error && <p className={styles.error}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating…' : 'Create Event'}
      </button>
    </form>
  )
}
