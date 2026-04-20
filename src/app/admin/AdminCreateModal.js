'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import EventForm from './EventForm'
import styles from './AdminCreateModal.module.scss'

export default function AdminCreateModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState(false)

  function handleClose() {
    setOpen(false)
    if (created) {
      router.refresh()
      setCreated(false)
    }
  }

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, created])

  return (
    <>
      <button className={styles.fab} onClick={() => setOpen(true)} aria-label="Create event">
        +
      </button>

      {open && (
        <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}>
          <div className={styles.modal}>
            <button className={styles.close} onClick={handleClose} aria-label="Close">✕</button>
            <EventForm onSuccess={() => setCreated(true)} />
          </div>
        </div>
      )}
    </>
  )
}
