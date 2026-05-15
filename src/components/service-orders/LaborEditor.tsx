"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus } from 'lucide-react'

interface Service {
  description: string
  value: number
}

interface LaborEditorProps {
  services: Service[]
  onChange: (services: Service[]) => void
}

export function LaborEditor({ services, onChange }: LaborEditorProps) {
  const addService = () => {
    onChange([...services, { description: '', value: 0 }])
  }

  const removeService = (index: number) => {
    onChange(services.filter((_, i) => i !== index))
  }

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const updated = services.map((svc, i) =>
      i === index ? { ...svc, [field]: value } : svc
    )
    onChange(updated)
  }

  const total = services.reduce((sum, svc) => sum + svc.value, 0)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {services.map((svc, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
              <Input
                value={svc.description}
                onChange={(e) => updateService(index, 'description', e.target.value)}
                placeholder="Descrição do serviço"
              />
            </div>
            <div className="w-28">
              <label className="text-xs text-muted-foreground mb-1 block">Valor</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={svc.value}
                onChange={(e) => updateService(index, 'value', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="w-24 pt-5 text-sm text-muted-foreground text-right">
              {formatCurrency(svc.value)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => removeService(index)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addService}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Serviço
      </Button>

      <div className="text-right text-sm font-medium">
        Total Mão de Obra: {formatCurrency(total)}
      </div>
    </div>
  )
}
