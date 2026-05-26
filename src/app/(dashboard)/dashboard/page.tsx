"use client"

import { useEffect, useState } from "react"
import { DashboardCards } from "@/components/dashboard/DashboardCards"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { ReturnRateChart } from "@/components/dashboard/ReturnRateChart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate, getStatusLabel } from "@/utils/formatters"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import type { ServiceOrder } from "@/types"

export default function DashboardPage() {
  const [recentOrders, setRecentOrders] = useState<ServiceOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("service_orders")
        .select("*, customers(name)")
        .order("created_at", { ascending: false })
        .limit(5)

      setRecentOrders(data || [])
      setLoadingOrders(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral do seu negócio
        </p>
      </div>

      <ErrorBoundary><DashboardCards /></ErrorBoundary>

      <div className="grid gap-6 lg:grid-cols-2">
        <ErrorBoundary><RevenueChart /></ErrorBoundary>
        <ErrorBoundary><ReturnRateChart /></ErrorBoundary>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Ordens de Serviço Recentes</h2>
        {loadingOrders ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {(order as any).customers?.name || "-"}
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_amount || 0)}</TableCell>
                  <TableCell>{getStatusLabel(order.status)}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                </TableRow>
              ))}
              {recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhuma ordem de serviço encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
