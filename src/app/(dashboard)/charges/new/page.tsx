"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/useDebounce"
import { formatCurrency } from "@/utils/formatters"

export default function NewChargePage() {
  const router = useRouter()
  const [customerSearch, setCustomerSearch] = useState("")
  const debouncedSearch = useDebounce(customerSearch, 300)
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string }>>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [selectedCustomerName, setSelectedCustomerName] = useState("")
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split("T")[0]
  })
  const [submitting, setSubmitting] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  useEffect(() => {
    if (!debouncedSearch) { setCustomers([]); return }
    setLoadingCustomers(true)
    fetch(`/api/customers?search=${encodeURIComponent(debouncedSearch)}&limit=5`)
      .then((r) => r.json())
      .then((data) => setCustomers(data.data || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoadingCustomers(false))
  }, [debouncedSearch])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCustomerId) { toast.error("Selecione um cliente"); return }
    if (!amount || parseFloat(amount) <= 0) { toast.error("Informe um valor válido"); return }

    setSubmitting(true)
    try {
      const res = await fetch("/api/charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomerId,
          amount: parseFloat(amount),
          due_date: dueDate,
          customer_phone: selectedCustomerPhone || undefined,
          description: "Cobrança AutoRecall CRM",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao criar cobrança")
      toast.success("Cobrança criada com sucesso!")
      router.push("/charges")
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao criar cobrança"
      toast.error(msg)
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
          <h1 className="text-2xl font-bold tracking-tight">Nova Cobrança</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crie uma cobrança com PIX para o cliente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
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
                    setSelectedCustomerPhone(c.phone)
                    setCustomerSearch(c.name)
                    setCustomers([])
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

        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Data de Vencimento</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Criando..." : "Criar Cobrança PIX"}
        </Button>
      </form>
    </div>
  )
}
