"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useServiceOrders } from '@/hooks/useServiceOrders'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface ServiceOrderTableProps {
  status?: string
  dateFrom?: string
  dateTo?: string
  customerSearch?: string
}

export function ServiceOrderTable({ status, dateFrom, dateTo, customerSearch }: ServiceOrderTableProps) {
  const router = useRouter()
  const { orders, loading } = useServiceOrders({
    status: status === 'all' ? undefined : status,
    date_from: dateFrom,
    date_to: dateTo,
    customerSearch,
  })

  const isEmpty = !loading && !orders.length

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Veículo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={`skel-${i}`}>
              {Array.from({ length: 7 }).map((_, j) => (
                <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
              ))}
            </TableRow>
          ))}
          {isEmpty && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                Nenhuma ordem de serviço encontrada
              </TableCell>
            </TableRow>
          )}
          {!loading && !isEmpty && orders.map((order) => (
            <TableRow
              key={order.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/service-orders/${order.id}`)}
            >
              <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
              <TableCell>{order.customer?.name || '—'}</TableCell>
              <TableCell>{order.vehicle?.plate || '—'}</TableCell>
              <TableCell><StatusBadge status={order.status} /></TableCell>
              <TableCell>{formatCurrency(order.total_amount || 0)}</TableCell>
              <TableCell>{order.created_at ? formatDate(order.created_at) : '—'}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
