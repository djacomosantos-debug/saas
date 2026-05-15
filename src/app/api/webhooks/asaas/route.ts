import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase/server'

async function verifyAsaasSignature(body: string, signature: string | null): Promise<boolean> {
  if (!signature) return false
  const secret = process.env.ASAAS_WEBHOOK_SECRET
  if (!secret) return true

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const expected = await crypto.subtle.verify(
      'HMAC',
      key,
      hexToBuffer(signature),
      encoder.encode(body)
    )
    return expected
  } catch {
    return false
  }
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = hex.replace(/^0x/i, '').match(/.{1,2}/g) || []
  return new Uint8Array(bytes.map((b) => parseInt(b, 16))).buffer
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-asaas-signature')

    if (!(await verifyAsaasSignature(rawBody, signature))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const event = body.event
    const supabase = await createServiceSupabase()
    const asaasId = body.payment?.id || body.id

    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        if (asaasId) {
          await supabase
            .from('charges')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('asaas_charge_id', asaasId)
        }
        break

      case 'PAYMENT_OVERDUE':
        if (asaasId) {
          await supabase
            .from('charges')
            .update({ status: 'overdue' })
            .eq('asaas_charge_id', asaasId)
        }
        break

      case 'PAYMENT_REFUNDED':
      case 'PAYMENT_CANCELLED':
        if (asaasId) {
          await supabase
            .from('charges')
            .update({ status: 'overdue' })
            .eq('asaas_charge_id', asaasId)
        }
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Asaas webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
