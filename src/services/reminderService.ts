import { createClient } from '@/lib/supabase/client'

export async function createReminder(data: {
  user_id: string
  customer_id: string
  vehicle_id: string
  service_order_id?: string
  reminder_type: string
  scheduled_for: string
}) {
  const supabase = createClient()
  const { data: reminder, error } = await supabase
    .from('reminders')
    .insert([{ ...data, status: 'scheduled' }])
    .select()
    .single()
  return { reminder, error }
}

export async function processPendingReminders() {
  const supabase = createClient()
  const now = new Date().toISOString()

  const { data: pending } = await supabase
    .from('reminders')
    .select('*, customer:customers(*), vehicle:vehicles(*)')
    .eq('status', 'scheduled')
    .lte('scheduled_for', now)

  if (!pending) return { processed: 0 }

  let processed = 0
  for (const reminder of pending) {
    const { error } = await supabase
      .from('reminders')
      .update({ status: 'sent', sent_at: now })
      .eq('id', reminder.id)
    if (!error) processed++
  }

  return { processed }
}

export async function getPendingRemindersCount() {
  const supabase = createClient()
  const { count } = await supabase
    .from('reminders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'scheduled')
  return count || 0
}
