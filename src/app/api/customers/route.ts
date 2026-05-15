import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { customerSchema } from "@/utils/validators"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))
  const from = (page - 1) * limit
  const to = from + limit - 1

  const supabase = await createServerSupabase()

  let query = supabase
    .from("customers")
    .select("*, vehicles:vehicles(count)", { count: "exact" })

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data, count, error } = await query
    .range(from, to)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const customers = data?.map((c: any) => ({
    ...c,
    vehicle_count: c.vehicles?.[0]?.count || 0,
  }))

  return NextResponse.json({ data: customers, total: count })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = customerSchema.safeParse(body)

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
    .from("customers")
    .insert({ ...parsed.data, user_id: user.user.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
