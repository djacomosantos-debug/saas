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
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useServiceOrders } from '@/hooks/useServiceOrders'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface ServiceOrderTableProps {
  status?: string
  dateFrom?: string
  dateTo?: string
}

export function ServiceOrderTable({ status, dateFrom, dateTo }: ServiceOrderTableProps) {
  const router = useRouter()
  const { orders, loading } = useServiceOrders({
    status: status === 'all' ? undefined : status,
    date_from: dateFrom,
    date_to: dateTo,
  })

  if (loading) {
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma ordem de serviço encontrada
      </div>
    )
  }

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
          {orders.map((order) => (
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
