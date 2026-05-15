import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabase()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const now = new Date()
  const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()

  const [
    revenueRes,
    prevRevenueRes,
    customersRes,
    vehiclesRes,
    remindersRes,
    ordersRes,
  ] = await Promise.all([
    supabase
      .from("service_orders")
      .select("total_amount")
      .eq("status", "completed")
      .gte("completed_at", firstDayMonth),
    supabase
      .from("service_orders")
      .select("total_amount")
      .eq("status", "completed")
      .gte("completed_at", firstDayPrevMonth)
      .lte("completed_at", lastDayPrevMonth),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .eq("status", "scheduled"),
    supabase
      .from("service_orders")
      .select("customer_id")
      .eq("status", "completed"),
  ])

  const monthlyRevenue =
    revenueRes.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
  const prevRevenue =
    prevRevenueRes.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

  const customerOrderCount: Record<string, number> = {}
  ordersRes.data?.forEach((o) => {
    customerOrderCount[o.customer_id] =
      (customerOrderCount[o.customer_id] || 0) + 1
  })
  const returningCustomers = Object.values(customerOrderCount).filter(
    (c) => c >= 2
  ).length
  const totalCustomers = customersRes.count || 1
  const returnRate = (returningCustomers / totalCustomers) * 100

  const completedOrdersCount = ordersRes.data?.length || 0
  const avgTicket = completedOrdersCount
    ? monthlyRevenue / completedOrdersCount
    : 0

  const stats = {
    monthly_revenue: monthlyRevenue,
    active_customers: customersRes.count || 0,
    total_vehicles: vehiclesRes.count || 0,
    pending_reminders: remindersRes.count || 0,
    return_rate: Math.round(returnRate * 10) / 10,
    avg_ticket: avgTicket,
    revenue_variation: prevRevenue
      ? ((monthlyRevenue - prevRevenue) / prevRevenue) * 100
      : 0,
    customers_variation: 0,
  }

  return NextResponse.json(stats)
}
