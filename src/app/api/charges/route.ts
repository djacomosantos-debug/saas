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
  if (!userData?.user) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
  }

  let asaasResult: any = { id: null }
  try {
    if (process.env.ASAAS_API_KEY && process.env.ASAAS_API_URL) {
      asaasResult = await createPixCharge({
        customer: body.customer_id,
        value: body.amount,
        dueDate: body.due_date,
        description: body.description || 'Serviço AutoRecall CRM',
      })
    } else {
      console.warn('Asaas não configurado — criando cobrança sem integração PIX')
    }
  } catch (err) {
    console.error('Erro Asaas:', err)
  }

  let pixPayload: string | null = null
  if (asaasResult.id) {
    try {
      const pixResult = await getPixQrCode(asaasResult.id)
      pixPayload = pixResult?.payload || pixResult?.encodedImage || null
    } catch (err) {
      console.error('Erro ao obter QR Code PIX:', err)
    }
  }

  const { data: charge, error } = await supabase
    .from('charges')
    .insert([{
      user_id: userData.user.id,
      customer_id: body.customer_id,
      service_order_id: body.service_order_id || null,
      amount: body.amount,
      due_date: body.due_date,
      asaas_charge_id: asaasResult.id || null,
      pix_payload: pixPayload,
      status: 'pending',
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (charge?.pix_payload && body.customer_phone) {
    try {
      const message = `Olá! O serviço foi concluído.\n\n💰 Valor: ${formatCurrency(body.amount)}\n\nPIX para pagamento:\n\`${charge.pix_payload}\`\n\nObrigado pela preferência! 🔧`
      await sendWhatsAppMessage(body.customer_phone, message)
    } catch (err) {
      console.error('Erro ao enviar WhatsApp:', err)
    }
  }

  return NextResponse.json(charge, { status: 201 })
}
