"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboard } from "@/hooks/useDashboard"
import { formatCurrency } from "@/utils/formatters"
import { DollarSign, Users, Car, Bell, Percent, Receipt } from "lucide-react"

const cards = [
  {
    key: "monthly_revenue" as const,
    title: "Faturamento Mensal",
    icon: DollarSign,
    format: (v: number) => formatCurrency(v),
    variationKey: "revenue_variation" as const,
  },
  {
    key: "active_customers" as const,
    title: "Clientes Ativos",
    icon: Users,
    format: (v: number) => String(v),
    variationKey: "customers_variation" as const,
  },
  {
    key: "total_vehicles" as const,
    title: "Veículos Cadastrados",
    icon: Car,
    format: (v: number) => String(v),
  },
  {
    key: "pending_reminders" as const,
    title: "Lembretes Pendentes",
    icon: Bell,
    format: (v: number) => String(v),
  },
  {
    key: "return_rate" as const,
    title: "Taxa de Retorno",
    icon: Percent,
    format: (v: number) => `${v.toFixed(1)}%`,
  },
  {
    key: "avg_ticket" as const,
    title: "Ticket Médio",
    icon: Receipt,
    format: (v: number) => formatCurrency(v),
  },
]

export function DashboardCards() {
  const { stats, loading } = useDashboard()

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        const value = stats ? stats[card.key] : 0

        let variation: number | null = null
        if ("variationKey" in card && stats) {
          variation = stats[card.variationKey as keyof typeof stats] as number
        }

        return (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.format(value)}</div>
              {variation !== null && (
                <p
                  className={`text-xs mt-1 ${
                    variation >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {variation >= 0 ? "+" : ""}
                  {variation.toFixed(1)}% em relação ao mês anterior
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
