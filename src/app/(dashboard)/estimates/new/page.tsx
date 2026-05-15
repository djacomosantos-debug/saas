"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { EstimateBuilder } from "@/components/estimates/EstimateBuilder"
import { Search, ArrowLeft } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { useEffect } from "react"

export default function NewEstimatePage() {
  const router = useRouter()
  const [customerSearch, setCustomerSearch] = useState("")
  const debouncedSearch = useDebounce(customerSearch, 300)
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string }>>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [selectedCustomerName, setSelectedCustomerName] = useState("")
  const [selectedVehicleId, setSelectedVehicleId] = useState("")
  const [vehicles, setVehicles] = useState<Array<{ id: string; plate: string; brand: string; model: string; year: number }>>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!debouncedSearch) { setCustomers([]); return }
    setLoadingCustomers(true)
    fetch(`/api/customers?search=${encodeURIComponent(debouncedSearch)}&limit=5`)
      .then((r) => r.json())
      .then((data) => setCustomers(data.customers || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoadingCustomers(false))
  }, [debouncedSearch])

  useEffect(() => {
    if (!selectedCustomerId) { setVehicles([]); return }
    fetch(`/api/vehicles?customer_id=${selectedCustomerId}`)
      .then((r) => r.json())
      .then((data) => setVehicles(data.vehicles || []))
      .catch(() => setVehicles([]))
  }, [selectedCustomerId])

  async function handleSubmit(values: { items: Array<{ description: string; quantity: number; unit_price: number; type: string }> }) {
    if (!selectedCustomerId) {
      toast.error("Selecione um cliente")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomerId,
          vehicle_id: selectedVehicleId || null,
          items: values.items.map((i) => ({
            ...i,
            total: i.quantity * i.unit_price,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao criar orçamento")
      toast.success("Orçamento criado com sucesso!")
      router.push("/estimates")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar orçamento"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Orçamento</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crie um orçamento para enviar ao cliente
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Buscar cliente..."
                className="pl-9"
              />
            </div>
            {loadingCustomers && <p className="text-sm text-muted-foreground">Buscando...</p>}
            {customers.length > 0 && (
              <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                {customers.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                      selectedCustomerId === c.id ? "bg-muted font-medium" : ""
                    }`}
                    onClick={() => {
                      setSelectedCustomerId(c.id)
                      setSelectedCustomerName(c.name)
                      setCustomerSearch(c.name)
                      setCustomers([])
                      setSelectedVehicleId("")
                    }}
                  >
                    {c.name} — {c.phone}
                  </button>
                ))}
              </div>
            )}
            {selectedCustomerName && !customers.length && (
              <p className="text-sm font-medium text-muted-foreground">{selectedCustomerName}</p>
            )}
          </div>

          {selectedCustomerId && vehicles.length > 0 && (
            <div className="space-y-2">
              <Label>Veículo (opcional)</Label>
              <div className="grid gap-2">
                {vehicles.map((v) => (
                  <label
                    key={v.id}
                    className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted has-[:checked]:border-primary"
                  >
                    <input
                      type="radio"
                      name="vehicle_id"
                      className="accent-primary"
                      checked={selectedVehicleId === v.id}
                      onChange={() => setSelectedVehicleId(v.id)}
                    />
                    <div>
                      <p className="text-sm font-medium">{v.brand} {v.model}</p>
                      <p className="text-xs text-muted-foreground">{v.plate} — {v.year}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <EstimateBuilder onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  )
}
