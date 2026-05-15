"use client"

import { useEffect, useState, Fragment } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { PixViewer } from "@/components/charges/PixViewer"
import { formatCurrency, formatDate } from "@/utils/formatters"
import { Plus, ChevronDown, ChevronRight } from "lucide-react"
import type { Charge } from "@/types"

export default function ChargesPage() {
  const router = useRouter()
  const [charges, setCharges] = useState<Charge[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("charges")
        .select("*, customer:customers(*)")
        .order("created_at", { ascending: false })
      if (data) setCharges(data as unknown as Charge[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cobranças</h1>
        <Button onClick={() => router.push("/charges/new")}>
          <Plus className="h-4 w-4 mr-2" /> Nova Cobrança
        </Button>
      </div>

      {charges.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma cobrança encontrada
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charges.map((charge) => (
                <Fragment key={charge.id}>
                  <TableRow
                    key={charge.id}
                    className="cursor-pointer"
                    onClick={() => setExpandedId(expandedId === charge.id ? null : charge.id)}
                  >
                    <TableCell>{charge.customer?.name || "—"}</TableCell>
                    <TableCell>{formatCurrency(charge.amount || 0)}</TableCell>
                    <TableCell>{charge.due_date ? formatDate(charge.due_date) : "—"}</TableCell>
                    <TableCell><StatusBadge status={charge.status} /></TableCell>
                    <TableCell>{charge.created_at ? formatDate(charge.created_at) : "—"}</TableCell>
                  </TableRow>
                  {expandedId === charge.id && charge.pix_payload && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-muted/30">
                        <PixViewer pixPayload={charge.pix_payload} amount={charge.amount || 0} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
