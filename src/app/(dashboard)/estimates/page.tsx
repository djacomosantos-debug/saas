"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate, getStatusLabel } from "@/utils/formatters"
import type { Estimate } from "@/types"

export default function EstimatesPage() {
  const router = useRouter()
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("estimates")
        .select("*, customers(name)")
        .order("created_at", { ascending: false })

      setEstimates(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os orçamentos enviados aos clientes
          </p>
        </div>
        <Button onClick={() => router.push("/estimates/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : estimates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">Nenhum orçamento encontrado</p>
          <p className="text-sm">Crie seu primeiro orçamento.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estimates.map((estimate) => (
              <TableRow
                key={estimate.id}
                className="cursor-pointer"
                onClick={() => router.push(`/estimates/${estimate.id}`)}
              >
                <TableCell className="font-mono text-xs">
                  #{estimate.id.slice(0, 8)}
                </TableCell>
                <TableCell className="font-medium">
                  {(estimate as any).customers?.name || "-"}
                </TableCell>
                <TableCell>{formatCurrency(estimate.total_amount || 0)}</TableCell>
                <TableCell>{getStatusLabel(estimate.status)}</TableCell>
                <TableCell>{formatDate(estimate.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
