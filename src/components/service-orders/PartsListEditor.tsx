"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus } from 'lucide-react'

interface Part {
  name: string
  quantity: number
  unitPrice: number
}

interface PartsListEditorProps {
  parts: Part[]
  onChange: (parts: Part[]) => void
}

export function PartsListEditor({ parts, onChange }: PartsListEditorProps) {
  const addPart = () => {
    onChange([...parts, { name: '', quantity: 1, unitPrice: 0 }])
  }

  const removePart = (index: number) => {
    onChange(parts.filter((_, i) => i !== index))
  }

  const updatePart = (index: number, field: keyof Part, value: string | number) => {
    const updated = parts.map((part, i) =>
      i === index ? { ...part, [field]: value } : part
    )
    onChange(updated)
  }

  const total = parts.reduce((sum, part) => sum + part.quantity * part.unitPrice, 0)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {parts.map((part, index) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Peça</label>
              <Input
                value={part.name}
                onChange={(e) => updatePart(index, 'name', e.target.value)}
                placeholder="Nome da peça"
              />
            </div>
            <div className="w-20">
              <label className="text-xs text-muted-foreground mb-1 block">Qtd</label>
              <Input
                type="number"
                min="1"
                value={part.quantity}
                onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="w-28">
              <label className="text-xs text-muted-foreground mb-1 block">Preço Unit.</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={part.unitPrice}
                onChange={(e) => updatePart(index, 'unitPrice', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="w-24 pt-5 text-sm text-muted-foreground text-right">
              {formatCurrency(part.quantity * part.unitPrice)}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => removePart(index)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={addPart}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Peça
      </Button>

      <div className="text-right text-sm font-medium">
        Total Peças: {formatCurrency(total)}
      </div>
    </div>
  )
}
