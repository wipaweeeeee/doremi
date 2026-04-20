'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './TicketSelector.module.scss'

function formatPrice(price_cents) {
  if (price_cents === 0) return 'Free'
  return `$${(price_cents / 100).toFixed(2)}`
}

function TicketCard({ tt, event }) {
  const router = useRouter()
  const isFree = tt.price_cents === 0
  const isSoldOut = tt.spotsRemaining === 0

  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Free ticket flow state
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  async function handleBook() {
    if (isFree) {
      setShowForm(true)
      return
    }

    setLoading(true)
    setError(null)

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketTypeId: tt.id, quantity }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    router.push(data.url)
  }

  async function handleFreeSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketTypeId: tt.id, quantity: 1, name, email }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    setConfirmed(true)
    setLoading(false)
  }

  return (
    <div className={`${styles.card} ${isSoldOut ? styles.soldOut : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardInfo}>
          <p className={styles.cardName}>{tt.name}</p>
          {tt.description && <p className={styles.cardDescription}>{tt.description}</p>}
        </div>
        <p className={styles.cardPrice}>{formatPrice(tt.price_cents)}</p>
      </div>

      {isSoldOut ? (
        <p className={styles.soldOutLabel}>Sold out</p>
      ) : confirmed ? (
        <p className={styles.confirmation}>You're on the list! Check your email.</p>
      ) : showForm ? (
        <form className={styles.freeForm} onSubmit={handleFreeSubmit}>
          <label className={styles.formField}>
            Name
            <input
              className={styles.formInput}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className={styles.formField}>
            Email
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => { setShowForm(false); setError(null) }}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className={styles.bookButton} disabled={loading}>
              {loading ? 'Reserving…' : 'Reserve spot'}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.cardActions}>
          {!isFree && (
            <select
              className={styles.quantitySelect}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          )}
          {error && <p className={styles.error}>{error}</p>}
          <button
            className={styles.bookButton}
            onClick={handleBook}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Book'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function TicketSelector({ ticketTypes, event }) {
  if (!ticketTypes?.length) return null

  return (
    <div className={styles.selector}>
      {ticketTypes.map((tt) => (
        <TicketCard key={tt.id} tt={tt} event={event} />
      ))}
    </div>
  )
}
