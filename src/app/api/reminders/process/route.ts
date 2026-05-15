import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServerSupabase()
  const now = new Date().toISOString()

  const { data: pending } = await supabase
    .from('reminders')
    .select('*, customer:customers(*), vehicle:vehicles(*)')
    .eq('status', 'scheduled')
    .lte('scheduled_for', now)

  if (!pending || pending.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let processed = 0
  for (const reminder of pending) {
    const { error } = await supabase
      .from('reminders')
      .update({ status: 'sent', sent_at: now })
      .eq('id', reminder.id)
    if (!error) processed++
  }

  return NextResponse.json({ processed })
}
