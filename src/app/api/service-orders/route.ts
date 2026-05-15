import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

const createSchema = z.object({
  customer_id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  diagnosis: z.string().min(1).optional().or(z.literal('')),
  parts: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })).optional(),
  services: z.array(z.object({
    description: z.string().min(1),
    value: z.number().min(0),
  })).optional(),
  parts_total: z.number().min(0).optional(),
  labor_total: z.number().min(0).optional(),
  mileage: z.number().nullable().optional(),
  next_service_date: z.string().nullable().optional(),
  next_service_mileage: z.number().nullable().optional(),
  charge_on_complete: z.boolean().optional(),
  status: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { searchParams } = new URL(request.url)

  const status = searchParams.get('status')
  const customer_id = searchParams.get('customer_id')
  const vehicle_id = searchParams.get('vehicle_id')
  const date_from = searchParams.get('date_from')
  const date_to = searchParams.get('date_to')
  const customerSearch = searchParams.get('customerSearch')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  let query = supabase
    .from('service_orders')
    .select(`
      *,
      customer:customers(*),
      vehicle:vehicles(*)
    `, { count: 'exact' })

  if (status) {
    query = query.eq('status', status)
  }
  if (customer_id) {
    query = query.eq('customer_id', customer_id)
  }
  if (vehicle_id) {
    query = query.eq('vehicle_id', vehicle_id)
  }
  if (date_from) {
    query = query.gte('created_at', date_from)
  }
  if (date_to) {
    query = query.lte('created_at', date_to)
  }

  // If searching by customer name, we filter via the join
  if (customerSearch) {
    query = query.ilike('customer.name', `%${customerSearch}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    orders: data,
    total: count,
    page,
    totalPages: count ? Math.ceil(count / limit) : 0,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const body = await request.json()

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { next_service_date, next_service_mileage, charge_on_complete, ...data } = parsed.data
  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user_id = userData?.user?.id

  if (!user_id) {
    return NextResponse.json({ error: 'Usuário não autenticado', details: userError }, { status: 401 })
  }

  const insertData: Record<string, unknown> = {
    customer_id: data.customer_id,
    vehicle_id: data.vehicle_id,
    user_id,
    diagnosis: data.diagnosis || '',
    parts_total: data.parts_total || 0,
    labor_total: data.labor_total || 0,
    mileage: data.mileage || null,
    status: data.status || 'open',
    charge_on_complete: charge_on_complete || false,
    next_service_date: next_service_date || null,
    next_service_mileage: next_service_mileage || null,
  }

  const { data: order, error } = await supabase
    .from('service_orders')
    .insert([insertData])
    .select(`
      *,
      customer:customers(*),
      vehicle:vehicles(*)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (next_service_date || next_service_mileage) {
    const reminderData: Record<string, unknown> = {
      user_id,
      service_order_id: order.id,
      customer_id: data.customer_id,
      vehicle_id: data.vehicle_id,
      reminder_type: 'revision',
      status: 'scheduled',
    }
    if (next_service_date) {
      reminderData.scheduled_for = new Date(next_service_date).toISOString()
    } else {
      reminderData.scheduled_for = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    await supabase.from('reminders').insert(reminderData)
  }

  return NextResponse.json(order, { status: 201 })
}
