"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { VehicleCard } from "@/components/vehicles/VehicleCard"
import { formatPhone, formatDate, getStatusLabel } from "@/utils/formatters"
import { useVehicles } from "@/hooks/useVehicles"
import { useServiceOrders } from "@/hooks/useServiceOrders"
import { toast } from "sonner"
import { Pencil, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Customer } from "@/types"

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const { vehicles } = useVehicles(params.id as string)
  const { orders } = useServiceOrders({ customer_id: params.id as string })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("customers")
        .select("*")
        .eq("id", params.id)
        .single()

      if (data) {
        setCustomer(data)
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return

    const supabase = createClient()
    const { error } = await supabase.from("customers").delete().eq("id", params.id)

    if (error) {
      toast.error("Erro ao excluir cliente")
    } else {
      toast.success("Cliente excluído com sucesso!")
      router.push("/customers")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/customers")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/customers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Telefone</p>
            <p>{formatPhone(customer.phone)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p>{customer.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cliente desde</p>
            <p>{formatDate(customer.created_at)}</p>
          </div>
          {customer.notes && (
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Veículos ({vehicles.length})</h2>
        {vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <Link key={v.id} href={`/vehicles/${v.id}`}>
                <VehicleCard vehicle={v} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">Ordens de Serviço ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma ordem de serviço.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium">
                      OS #{order.id.slice(0, 8)} — {order.vehicle?.plate || 'Veículo'}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                  <p className="text-sm">{getStatusLabel(order.status)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
