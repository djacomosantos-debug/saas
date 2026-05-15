"use client"

import { ServiceOrderForm } from '@/components/service-orders/ServiceOrderForm'

export default function NewServiceOrderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nova Ordem de Serviço</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os dados para criar uma nova ordem de serviço
        </p>
      </div>
      <ServiceOrderForm />
    </div>
  )
}
