"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'

interface ChargeFormProps {
  serviceOrderId: string
  amount: number
  customerPhone?: string
  customerId: string
  onSuccess?: () => void
}

export function ChargeForm({ serviceOrderId, amount, customerPhone, customerId, onSuccess }: ChargeFormProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_order_id: serviceOrderId,
          customer_id: customerId,
          amount,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customer_phone: customerPhone,
          description: 'Serviço AutoRecall CRM',
        }),
      })
      if (!res.ok) throw new Error('Erro ao criar cobrança')
      toast.success('Cobrança criada com sucesso!')
      setOpen(false)
      onSuccess?.()
    } catch {
      toast.error('Erro ao criar cobrança')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> Gerar Cobrança PIX</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Cobrança</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input value={formatCurrency(amount)} disabled />
          </div>
          <div className="space-y-2">
            <Label>Vencimento</Label>
            <Input value={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} disabled />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? 'Criando...' : 'Confirmar e Gerar PIX'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
