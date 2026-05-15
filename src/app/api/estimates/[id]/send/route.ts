import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { sendWhatsAppMessage } from "@/lib/evolution"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: estimate, error: fetchError } = await supabase
    .from("estimates")
    .select("*, customer:customers(*), vehicle:vehicles(*)")
    .eq("id", id)
    .single()

  if (fetchError || !estimate) {
    return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 })
  }

  const approvalToken = crypto.randomUUID()

  const { error: updateError } = await supabase
    .from("estimates")
    .update({ approval_token: approvalToken })
    .eq("id", id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  const approvalLink = `${baseUrl}/public/estimate/${approvalToken}`
  const customerData = estimate.customer as unknown as { phone: string; name: string }
  const customerPhone = customerData?.phone

  if (!customerPhone) {
    return NextResponse.json({ error: "Cliente sem telefone cadastrado" }, { status: 400 })
  }

  const items = (estimate.items as Array<{ description: string; unit_price: number; quantity: number }>) || []
  const itemsText = items
    .map((item) =>
      `• ${item.description} — R$ ${(item.unit_price * item.quantity).toFixed(2)}`
    )
    .join("\n")

  const message = `Olá! Segue o orçamento para o serviço do seu veículo:\n\n${itemsText}\n\nTotal: R$ ${Number(estimate.total_amount).toFixed(2)}\n\nPara aprovar ou solicitar alterações, acesse:\n${approvalLink}`

  try {
    await sendWhatsAppMessage(customerPhone, message)
  } catch {
    return NextResponse.json({ error: "Erro ao enviar mensagem via WhatsApp" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
