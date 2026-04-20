import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

export async function POST(request) {
  const authClient = await createServerSupabaseClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, slug, description, date, capacity, image_url, published, ticketTypes } =
    await request.json()

  let stripeProduct
  try {
    stripeProduct = await stripe.products.create({ name: title })
  } catch (err) {
    return Response.json(
      { error: `Failed to create Stripe product: ${err.message}` },
      { status: 502 }
    )
  }

  let pricedTicketTypes
  try {
    pricedTicketTypes = await Promise.all(
      ticketTypes.map(async (tt, i) => {
        if (tt.price_cents === 0) {
          return { ...tt, stripe_price_id: null, sort_order: i }
        }
        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: tt.price_cents,
          currency: 'usd',
        })
        return { ...tt, stripe_price_id: price.id, sort_order: i }
      })
    )
  } catch (err) {
    await stripe.products.update(stripeProduct.id, { active: false }).catch(() => {})
    return Response.json(
      { error: `Failed to create Stripe price: ${err.message}` },
      { status: 502 }
    )
  }

  const supabase = createServiceRoleClient()

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      title,
      slug,
      description,
      date,
      capacity,
      image_url,
      published: published ?? false,
      stripe_product_id: stripeProduct.id,
    })
    .select()
    .single()

  if (eventError) {
    await stripe.products.update(stripeProduct.id, { active: false }).catch(() => {})
    return Response.json({ error: eventError.message }, { status: 500 })
  }

  const { data: tickets, error: ticketsError } = await supabase
    .from('ticket_types')
    .insert(
      pricedTicketTypes.map(({ name, description, price_cents, capacity, stripe_price_id, sort_order }) => ({
        event_id: event.id,
        name,
        description,
        price_cents,
        capacity: capacity ?? null,
        stripe_price_id,
        active: true,
        sort_order,
      }))
    )
    .select()

  if (ticketsError) {
    return Response.json({ error: ticketsError.message }, { status: 500 })
  }

  return Response.json({ ...event, ticket_types: tickets }, { status: 201 })
}
