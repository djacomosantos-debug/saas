"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EstimateApprovalCard } from "@/components/estimates/EstimateApprovalCard"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate, formatPlate, formatPhone, getStatusLabel } from "@/utils/formatters"
import { ArrowLeft, Send } from "lucide-react"
import { toast } from "sonner"
import type { Estimate } from "@/types"

export default function EstimateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [vehicle, setVehicle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: est } = await supabase
        .from("estimates")
        .select("*")
        .eq("id", id)
        .single()

      if (est) {
        setEstimate(est)
        const { data: cust } = await supabase
          .from("customers")
          .select("*")
          .eq("id", est.customer_id)
          .single()
        setCustomer(cust)

        if (est.vehicle_id) {
          const { data: veh } = await supabase
            .from("vehicles")
            .select("*")
            .eq("id", est.vehicle_id)
            .single()
          setVehicle(veh)
        }
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSend() {
    setSending(true)
    const res = await fetch(`/api/estimates/${id}/send`, { method: "POST" })
    if (res.ok) {
      toast.success("Orçamento enviado com sucesso!")
    } else {
      toast.error("Erro ao enviar orçamento")
    }
    setSending(false)
  }

  async function handleApprove() {
    const supabase = createClient()
    const { error } = await supabase
      .from("estimates")
      .update({ status: "approved" })
      .eq("id", id)
    if (error) {
      toast.error("Erro ao aprovar orçamento")
    } else {
      setEstimate((prev) => prev ? { ...prev, status: "approved" } : prev)
      toast.success("Orçamento aprovado!")
    }
  }

  async function handleReject() {
    const supabase = createClient()
    const { error } = await supabase
      .from("estimates")
      .update({ status: "rejected" })
      .eq("id", id)
    if (error) {
      toast.error("Erro ao rejeitar orçamento")
    } else {
      setEstimate((prev) => prev ? { ...prev, status: "rejected" } : prev)
      toast.success("Orçamento rejeitado")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-medium text-muted-foreground">Orçamento não encontrado</p>
        <Button variant="link" onClick={() => router.push("/estimates")}>Voltar</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Orçamento #{estimate.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getStatusLabel(estimate.status)} — {formatDate(estimate.created_at)}
          </p>
        </div>
        <div className="ml-auto">
          <Button onClick={handleSend} disabled={sending}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Enviando..." : "Enviar por WhatsApp"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EstimateApprovalCard
          estimate={estimate}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        <div className="space-y-6">
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="font-medium">Nome:</span> {customer.name}</p>
                <p><span className="font-medium">Telefone:</span> {formatPhone(customer.phone)}</p>
                <p><span className="font-medium">Email:</span> {customer.email || "-"}</p>
              </CardContent>
            </Card>
          )}

          {vehicle && (
            <Card>
              <CardHeader>
                <CardTitle>Veículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><span className="font-medium">Placa:</span> {formatPlate(vehicle.plate)}</p>
                <p><span className="font-medium">Modelo:</span> {vehicle.brand} {vehicle.model}</p>
                <p><span className="font-medium">Ano:</span> {vehicle.year || "-"}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
