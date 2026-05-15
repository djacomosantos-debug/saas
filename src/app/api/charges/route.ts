import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createPixCharge, getPixQrCode } from '@/lib/asaas'
import { sendWhatsAppMessage } from '@/lib/evolution'
import { formatCurrency } from '@/utils/formatters'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('charges')
    .select('*, customer:customers(*)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ charges: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const body = await request.json()
  const { data: userData } = await supabase.auth.getUser()

  const asaasResult = await createPixCharge({
    customer: body.customer_id,
    value: body.amount,
    dueDate: body.due_date,
    description: body.description || 'Serviço AutoRecall CRM',
  })

  const pixResult = asaasResult.id ? await getPixQrCode(asaasResult.id) : null

  const { data: charge, error } = await supabase
    .from('charges')
    .insert([{
      user_id: userData.user?.id,
      customer_id: body.customer_id,
      service_order_id: body.service_order_id || null,
      amount: body.amount,
      due_date: body.due_date,
      asaas_charge_id: asaasResult.id || null,
      pix_payload: pixResult?.payload || pixResult?.encodedImage || null,
      status: 'pending',
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (charge?.pix_payload && body.customer_phone) {
    const message = `Olá! O serviço foi concluído.\n\n💰 Valor: ${formatCurrency(body.amount)}\n\nPIX para pagamento:\n\`${charge.pix_payload}\`\n\nObrigado pela preferência! 🔧`
    await sendWhatsAppMessage(body.customer_phone, message)
  }

  return NextResponse.json(charge, { status: 201 })
}
