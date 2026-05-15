import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const event = body.event

    if (event === 'MESSAGE_SENT') {
      const supabase = await createServiceSupabase()
      await supabase
        .from('reminders')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', body.reminder_id)
    }

    if (event === 'MESSAGE_DELIVERED') {
      const supabase = await createServiceSupabase()
      await supabase
        .from('reminders')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', body.reminder_id)
    }

    if (event === 'MESSAGE_FAILED') {
      const supabase = await createServiceSupabase()
      await supabase
        .from('reminders')
        .update({ status: 'failed' })
        .eq('id', body.reminder_id)
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
