"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export function ReturnRateChart() {
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: orders } = await supabase
        .from('service_orders')
        .select('customer_id')
        .eq('status', 'completed')

      const counts: Record<string, number> = {}
      orders?.forEach((o) => { counts[o.customer_id] = (counts[o.customer_id] || 0) + 1 })
      const returning = Object.values(counts).filter(c => c >= 2).length
      const single = Object.values(counts).filter(c => c < 2).length

      setData([
        { name: 'Clientes Recorrentes', value: returning, color: 'hsl(var(--primary))' },
        { name: 'Primeira visita', value: single, color: 'hsl(var(--muted-foreground))' },
      ])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>Taxa de Retorno</CardTitle></CardHeader>
        <CardContent><div className="h-[300px] bg-muted animate-pulse rounded" /></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxa de Retorno</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
