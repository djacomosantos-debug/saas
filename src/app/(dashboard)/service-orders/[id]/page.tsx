"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ArrowLeft, Car, User, Calendar, Wrench } from 'lucide-react'
import Link from 'next/link'
import type { ServiceOrder } from '@/types'

export default function ServiceOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<ServiceOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('service_orders')
        .select('*, customer:customers(*), vehicle:vehicles(*)')
        .eq('id', params.id)
        .single()
      if (data) setOrder(data as unknown as ServiceOrder)
      setLoading(false)
    }
    if (params.id) load()
  }, [params.id])

  async function handleStatusChange(status: string) {
    setUpdating(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('service_orders')
      .update({
        status,
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq('id', params.id)

    if (error) {
      toast.error('Erro ao atualizar status')
    } else {
      toast.success('Status atualizado!')
      setOrder((prev) => prev ? { ...prev, status: status as ServiceOrder['status'], completed_at: status === 'completed' ? new Date().toISOString() : prev.completed_at } : null)
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!order) {
    return <div className="p-6 text-center text-muted-foreground">Ordem de serviço não encontrada</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/service-orders"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">OS #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground">{order.created_at ? formatDate(order.created_at) : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <Select value={order.status} onValueChange={handleStatusChange} disabled={updating}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Aberta</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Cliente</h2>
          <p className="text-sm">{order.customer?.name || '—'}</p>
          <p className="text-sm text-muted-foreground">{order.customer?.phone || ''}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Car className="h-4 w-4" /> Veículo</h2>
          <p className="text-sm">{order.vehicle?.brand} {order.vehicle?.model}</p>
          <p className="text-sm text-muted-foreground">{order.vehicle?.plate} — {order.vehicle?.year}</p>
        </div>
      </div>

      {order.diagnosis && (
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold flex items-center gap-2"><Wrench className="h-4 w-4" /> Diagnóstico</h2>
          <p className="text-sm whitespace-pre-wrap">{order.diagnosis}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold">Peças</h2>
          <p className="text-sm text-muted-foreercase">{formatCurrency(order.parts_total || 0)}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <h2 className="font-semibold">Mão de Obra</h2>
          <p className="text-sm text-muted-foreground">{formatCurrency(order.labor_total || 0)}</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 bg-muted/50">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-lg">{formatCurrency(order.total_amount || 0)}</span>
        </div>
      </div>

      {order.next_service_date && (
        <div className="rounded-lg border p-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Próxima revisão: {formatDate(order.next_service_date)}</span>
        </div>
      )}
    </div>
  )
}
