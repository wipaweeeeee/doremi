import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase'

export async function POST(request) {
  const authClient = await createServerSupabaseClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, slug, description, date, capacity, price_cents, image_url } =
    await request.json()

  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('events')
    .insert({ title, slug, description, date, capacity, price_cents, image_url })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data, { status: 201 })
}
