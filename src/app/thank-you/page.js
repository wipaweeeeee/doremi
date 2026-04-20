import Link from 'next/link'

export default function ThankYou() {
  return (
    <main style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h1>Thank you.</h1>
      <p>Confirmation email sent. See you soon.</p>
      <Link href="/">Return to all events</Link>
    </main>
  )
}
