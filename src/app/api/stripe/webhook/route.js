import { constructWebhookEvent } from '@/lib/stripe'
import { createServiceRoleClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  let event
  try {
    event = constructWebhookEvent(rawBody, signature)
  } catch (err) {
    return Response.json({ error: `Webhook verification failed: ${err.message}` }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true })
  }

  const session = event.data.object
  const { name, email, phone } = session.customer_details
  const { ticketTypeId, eventId, quantity: rawQuantity } = session.metadata
  const quantity = parseInt(rawQuantity, 10)
  const amount_paid = session.amount_total
  const stripe_session_id = session.id

  const supabase = createServiceRoleClient()

  const { data: ticketType, error: ttError } = await supabase
    .from('ticket_types')
    .select('name')
    .eq('id', ticketTypeId)
    .single()

  if (ttError || !ticketType) {
    return Response.json({ error: 'Ticket type not found' }, { status: 500 })
  }

  const { error: insertError } = await supabase.from('bookings').insert({
    event_id: eventId,
    ticket_type_id: ticketTypeId,
    ticket_type_name: ticketType.name,
    name,
    email,
    phone,
    quantity,
    amount_paid,
    stripe_session_id,
  })

  if (insertError) {
    // Unique constraint violation — already processed this session, safe to ack
    if (insertError.code === '23505') {
      return Response.json({ received: true })
    }
    return Response.json({ error: insertError.message }, { status: 500 })
  }

  // TODO: send confirmation email here

  return Response.json({ received: true })
}
