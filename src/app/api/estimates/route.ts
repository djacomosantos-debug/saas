import { NextRequest, NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"
import { estimateSchema } from "@/utils/validators"

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from("estimates")
    .select("*, customers(name)")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = estimateSchema.safeParse(body)

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

  const totalAmount = parsed.data.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  const { data, error } = await supabase
    .from("estimates")
    .insert({
      user_id: user.user.id,
      customer_id: parsed.data.customer_id,
      vehicle_id: parsed.data.vehicle_id || null,
      service_order_id: parsed.data.service_order_id || null,
      items: parsed.data.items,
      total_amount: totalAmount,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
