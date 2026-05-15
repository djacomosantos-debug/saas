import { createClient } from '@/lib/supabase/client'
import { createPixCharge, getPixQrCode } from '@/lib/asaas'
import { sendWhatsAppMessage } from '@/lib/evolution'
import type { Charge } from '@/types'
import { formatCurrency } from '@/utils/formatters'

export async function createCharge(data: {
  user_id: string
  customer_id: string
  service_order_id: string
  amount: number
  due_date: string
  customer_phone: string
  service_description: string
}) {
  const supabase = createClient()

  const asaasResult = await createPixCharge({
    customer: data.customer_id,
    value: data.amount,
    dueDate: data.due_date,
    description: data.service_description,
  })

  const pixResult = asaasResult.id ? await getPixQrCode(asaasResult.id) : null

  const { data: charge, error } = await supabase
    .from('charges')
    .insert([{
      user_id: data.user_id,
      customer_id: data.customer_id,
      service_order_id: data.service_order_id,
      amount: data.amount,
      due_date: data.due_date,
      asaas_charge_id: asaasResult.id || null,
      pix_payload: pixResult?.payload || pixResult?.encodedImage || null,
      status: 'pending',
    }])
    .select()
    .single()

  if (charge && data.customer_phone) {
    const message = `Olá! O serviço *${data.service_description}* foi concluído.\n\n💰 Valor: ${formatCurrency(data.amount)}\n\nPIX para pagamento:\n\`${charge.pix_payload}\`\n\nObrigado pela preferência! 🔧`
    await sendWhatsAppMessage(data.customer_phone, message)
  }

  return { charge, error }
}
