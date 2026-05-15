"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ServiceOrderTable } from '@/components/service-orders/ServiceOrderTable'
import { SearchInput } from '@/components/shared/SearchInput'
import { Filters } from '@/components/shared/Filters'

export default function ServiceOrdersPage() {
  const router = useRouter()
  const [status, setStatus] = useState('all')
  const [customerSearch, setCustomerSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ordens de Serviço</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie todas as ordens de serviço do sistema
          </p>
        </div>
        <Button onClick={() => router.push('/service-orders/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova OS
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Buscar cliente..."
          value={customerSearch}
          onChange={setCustomerSearch}
        />
        <Filters status={status} onStatusChange={setStatus} />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
          <span className="text-muted-foreground">até</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
      </div>

      <ServiceOrderTable
        status={status}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </div>
  )
}
