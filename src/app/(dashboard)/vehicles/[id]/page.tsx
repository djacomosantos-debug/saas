"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPlate, formatMileage, formatDate, getStatusLabel } from "@/utils/formatters"
import { useServiceOrders } from "@/hooks/useServiceOrders"
import { toast } from "sonner"
import { Pencil, Trash2, ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import type { Vehicle } from "@/types"

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<(Vehicle & { customer?: { id: string; name: string } }) | null>(null)
  const [loading, setLoading] = useState(true)

  const { orders } = useServiceOrders({ vehicle_id: params.id as string })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("vehicles")
        .select("*, customer:customers(id, name)")
        .eq("id", params.id)
        .single()

      if (data) {
        setVehicle(data as any)
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return

    const supabase = createClient()
    const { error } = await supabase.from("vehicles").delete().eq("id", params.id)

    if (error) {
      toast.error("Erro ao excluir veículo")
    } else {
      toast.success("Veículo excluído com sucesso!")
      router.push("/vehicles")
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

  if (!vehicle) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Veículo não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/vehicles")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/vehicles")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{formatPlate(vehicle.plate)}</h1>
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
          <CardTitle>Informações do Veículo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Marca</p>
            <p>{vehicle.brand || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Modelo</p>
            <p>{vehicle.model || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ano</p>
            <p>{vehicle.year ?? '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Motor</p>
            <p>{vehicle.engine || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Combustível</p>
            <p>{vehicle.fuel || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Km Atual</p>
            <p>{formatMileage(vehicle.current_mileage)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cadastrado em</p>
            <p>{formatDate(vehicle.created_at)}</p>
          </div>
        </CardContent>
      </Card>

      {vehicle.customer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/customers/${vehicle.customer.id}`} className="font-medium hover:underline">
              {vehicle.customer.name}
            </Link>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-xl font-semibold">Ordens de Serviço ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma ordem de serviço para este veículo.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-medium">
                      OS #{order.id.slice(0, 8)} — {order.customer?.name || 'Cliente'}
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
