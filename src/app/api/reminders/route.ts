import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  let query = supabase
    .from('reminders')
    .select('*, customer:customers(*), vehicle:vehicles(*)')
    .order('scheduled_for', { ascending: true })

  if (status) query = query.eq('status', status)
  if (type) query = query.eq('reminder_type', type)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reminders: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase()
  const body = await request.json()
  const { data: userData } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('reminders')
    .insert([{ ...body, user_id: userData.user?.id, status: 'scheduled' }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
