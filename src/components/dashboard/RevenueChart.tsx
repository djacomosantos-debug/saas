"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/utils/formatters'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function RevenueChart() {
  const [data, setData] = useState<{ month: string; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const months: { month: string; start: string; end: string }[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const monthName = d.toLocaleDateString('pt-BR', { month: 'short' })
        const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString()
        months.push({ month: monthName, start, end })
      }

      const results = await Promise.all(
        months.map((m) =>
          supabase
            .from('service_orders')
            .select('total_amount')
            .eq('status', 'completed')
            .gte('completed_at', m.start)
            .lte('completed_at', m.end)
        )
      )

      setData(
        months.map((m, i) => ({
          month: m.month,
          revenue: results[i].data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
        }))
      )
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Faturamento</CardTitle></CardHeader>
        <CardContent><div className="h-[300px] bg-muted animate-pulse rounded" /></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento (últimos 6 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: unknown) => formatCurrency(Number(v))} />
            <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
