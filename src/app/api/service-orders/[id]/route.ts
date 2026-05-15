import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).optional(),
  diagnosis: z.string().optional(),
  parts_total: z.number().min(0).optional(),
  labor_total: z.number().min(0).optional(),
  mileage: z.number().nullable().optional(),
  charge_on_complete: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase()
  const body = await request.json()
  const { id } = (await params)

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updateData: Record<string, unknown> = { ...parsed.data }

  if (updateData.status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  }

  const { data: order, error } = await supabase
    .from('service_orders')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      customer:customers(*),
      vehicle:vehicles(*)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (parsed.data.status === 'completed' && order?.charge_on_complete) {
    const customer = order.customer as unknown as { id: string; name: string; phone: string }
    const vehicle = order.vehicle as unknown as { brand: string; model: string; plate: string }

    const message = `Olá ${customer.name}, a ordem de serviço do veículo ${vehicle.brand} ${vehicle.model} (${vehicle.plate}) foi concluída! O valor total é de R$ ${(order.total_amount || 0).toFixed(2).replace('.', ',')}. Aguardamos seu contato para finalizar o pagamento.`

    await supabase.from('reminders').insert({
      user_id: order.user_id,
      service_order_id: id,
      customer_id: customer.id,
      reminder_type: 'follow_up',
      status: 'scheduled',
      scheduled_for: new Date().toISOString(),
    })
  }

  return NextResponse.json(order)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase()
  const { id } = (await params)

  const { error } = await supabase
    .from('service_orders')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Ordem de serviço excluída com sucesso' })
}
