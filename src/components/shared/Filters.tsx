"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getStatusLabel } from '@/utils/formatters'

interface FiltersProps {
  status: string
  onStatusChange: (value: string) => void
  statusOptions?: string[]
}

export function Filters({ status, onStatusChange, statusOptions = ['open', 'in_progress', 'completed', 'cancelled'] }: FiltersProps) {
  return (
    <Select value={status} onValueChange={onStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filtrar por status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos</SelectItem>
        {statusOptions.map((opt) => (
          <SelectItem key={opt} value={opt}>{getStatusLabel(opt)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
