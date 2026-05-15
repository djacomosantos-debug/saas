"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Search, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { PartsListEditor } from './PartsListEditor'
import { LaborEditor } from './LaborEditor'
import { MileageInput } from './MileageInput'
import { useDebounce } from '@/hooks/useDebounce'

type PartItem = { name: string; quantity: number; unitPrice: number }
type ServiceItem = { description: string; value: number }

export function ServiceOrderForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const debouncedSearch = useDebounce(customerSearch, 300)
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; phone: string }>>([])
  const [vehicles, setVehicles] = useState<Array<{ id: string; plate: string; brand: string; model: string; year: number }>>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [parts, setParts] = useState<PartItem[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [mileage, setMileage] = useState('')
  const [nextServiceDate, setNextServiceDate] = useState('')
  const [nextServiceMileage, setNextServiceMileage] = useState('')
  const [chargeOnComplete, setChargeOnComplete] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!debouncedSearch) { setCustomers([]); return }
    setLoadingCustomers(true)
    fetch(`/api/customers?search=${encodeURIComponent(debouncedSearch)}&limit=5`)
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoadingCustomers(false))
  }, [debouncedSearch])

  useEffect(() => {
    if (!selectedCustomerId) { setVehicles([]); return }
    fetch(`/api/vehicles?customer_id=${selectedCustomerId}`)
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles || []))
      .catch(() => setVehicles([]))
  }, [selectedCustomerId])

  const partsTotal = parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0)
  const servicesTotal = services.reduce((sum, s) => sum + s.value, 0)
  const grandTotal = partsTotal + servicesTotal

  const fmtCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const steps = [
    { label: 'Cliente/Veículo', description: 'Selecione o cliente e veículo' },
    { label: 'Diagnóstico', description: 'Descreva o diagnóstico' },
    { label: 'Peças/Mão de Obra', description: 'Adicione peças e serviços' },
    { label: 'Finalização', description: 'Revise e finalize' },
  ]

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (step === 1) {
      if (!selectedCustomerId) newErrors.customer_id = 'Selecione um cliente'
      if (!selectedVehicleId) newErrors.vehicle_id = 'Selecione um veículo'
    }
    if (step === 2 && !diagnosis.trim()) {
      newErrors.diagnosis = 'Descreva o diagnóstico'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 4))
  }

  const handlePrev = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        customer_id: selectedCustomerId,
        vehicle_id: selectedVehicleId,
        diagnosis,
        parts_total: partsTotal,
        labor_total: servicesTotal,
        mileage: mileage ? parseInt(mileage) : null,
        next_service_date: nextServiceDate || null,
        next_service_mileage: nextServiceMileage ? parseInt(nextServiceMileage) : null,
        charge_on_complete: chargeOnComplete,
        status: 'open',
      }
      const res = await fetch('/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erro ao criar ordem de serviço')
      }
      toast.success('Ordem de serviço criada com sucesso!')
      router.push('/service-orders')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar ordem de serviço'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step > i + 1 ? 'bg-primary text-primary-foreground' :
                step === i + 1 ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border mx-2" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Buscar cliente por nome..."
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
                      selectedCustomerId === c.id ? 'bg-muted font-medium' : ''
                    }`}
                    onClick={() => {
                      setSelectedCustomerId(c.id)
                      setCustomerSearch(c.name)
                      setCustomers([])
                      setSelectedVehicleId('')
                    }}
                  >
                    {c.name} — {c.phone}
                  </button>
                ))}
              </div>
            )}
            {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
          </div>

          {selectedCustomerId && (
            <div className="space-y-2">
              <Label>Veículo</Label>
              {vehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum veículo encontrado para este cliente</p>
              ) : (
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
              )}
              {errors.vehicle_id && <p className="text-sm text-red-500">{errors.vehicle_id}</p>}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Diagnóstico</Label>
            <Textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Descreva o diagnóstico detalhadamente..."
              rows={8}
            />
            {errors.diagnosis && <p className="text-sm text-red-500">{errors.diagnosis}</p>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Peças</h3>
            <PartsListEditor parts={parts} onChange={setParts} />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Mão de Obra</h3>
            <LaborEditor services={services} onChange={setServices} />
          </div>
          <div className="text-right text-lg font-bold">
            Total Geral: {fmtCurrency(grandTotal)}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <Label>Quilometragem Atual</Label>
            <MileageInput value={mileage} onChange={setMileage} />
          </div>
          <div className="space-y-2">
            <Label>Próxima Revisão (data)</Label>
            <Input type="date" value={nextServiceDate} onChange={(e) => setNextServiceDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Próxima Revisão (km)</Label>
            <MileageInput value={nextServiceMileage} onChange={setNextServiceMileage} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={chargeOnComplete} onCheckedChange={setChargeOnComplete} />
            <Label>Cobrar ao finalizar</Label>
          </div>
          <div className="border rounded-md p-4 space-y-2 bg-muted/50">
            <h4 className="font-medium">Resumo</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span>Peças</span><span>{fmtCurrency(partsTotal)}</span></div>
              <div className="flex justify-between"><span>Mão de Obra</span><span>{fmtCurrency(servicesTotal)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span><span>{fmtCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <Button type="button" variant="outline" onClick={handlePrev} disabled={step === 1}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <p className="text-sm text-muted-foreground">Passo {step} de 4</p>
        {step < 4 ? (
          <Button type="button" onClick={handleNext}>
            Próximo <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Salvando...' : 'Finalizar'} <Check className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
