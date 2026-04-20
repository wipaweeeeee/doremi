import { createServiceRoleClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

export async function POST(request) {
  const { ticketTypeId, quantity, name, email } = await request.json()

  const supabase = createServiceRoleClient()

  const { data: ticketType, error: ttError } = await supabase
    .from('ticket_types')
    .select('id, event_id, name, price_cents, capacity, stripe_price_id')
    .eq('id', ticketTypeId)
    .single()

  if (ttError || !ticketType) {
    return Response.json({ error: 'Ticket type not found' }, { status: 404 })
  }

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, slug, title, date, capacity')
    .eq('id', ticketType.event_id)
    .single()

  if (eventError || !event) {
    return Response.json({ error: 'Event not found' }, { status: 404 })
  }

  const { count: ticketTypeCount, error: ttCountError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('ticket_type_id', ticketTypeId)

  if (ttCountError) {
    return Response.json({ error: 'Failed to check availability' }, { status: 500 })
  }

  if (ticketType.capacity !== null && ticketTypeCount + quantity > ticketType.capacity) {
    return Response.json({ error: 'Sold out' }, { status: 409 })
  }

  const { count: eventCount, error: eventCountError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', ticketType.event_id)

  if (eventCountError) {
    return Response.json({ error: 'Failed to check availability' }, { status: 500 })
  }

  if (eventCount + quantity > event.capacity) {
    return Response.json({ error: 'Sold out' }, { status: 409 })
  }

  if (ticketType.price_cents === 0) {
    const { error: insertError } = await supabase.from('bookings').insert({
      event_id: ticketType.event_id,
      ticket_type_id: ticketTypeId,
      ticket_type_name: ticketType.name,
      name,
      email,
      quantity,
      amount_paid: 0,
    })

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500 })
    }

    return Response.json({ success: true, free: true })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const eventPath = `/events/${event.slug}`

  let session
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: ticketType.stripe_price_id, quantity }],
      success_url: `${baseUrl}/thank-you`,
      cancel_url: `${baseUrl}${eventPath}`,
      phone_number_collection: { enabled: true },
      billing_address_collection: 'auto',
      metadata: {
        ticketTypeId,
        eventId: ticketType.event_id,
        quantity: String(quantity),
      },
    })
  } catch (err) {
    return Response.json(
      { error: `Failed to create checkout session: ${err.message}` },
      { status: 502 }
    )
  }

  return Response.json({ url: session.url })
}
