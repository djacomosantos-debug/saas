import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { vehicleSchema } from "@/utils/validators"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customer_id")
  const search = searchParams.get("search") || ""

  const supabase = await createServerSupabase()

  let query = supabase
    .from("vehicles")
    .select("*, customer:customers(*)")

  if (customerId) {
    query = query.eq("customer_id", customerId)
  }
  if (search) {
    query = query.or(`plate.ilike.%${search}%,model.ilike.%${search}%`)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data || [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = vehicleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const supabase = await createServerSupabase()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("vehicles")
    .insert({ ...parsed.data, user_id: user.user.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
