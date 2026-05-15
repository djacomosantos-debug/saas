const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '-'
  return dateFormatter.format(new Date(date))
}

export function formatDateTime(date: string | Date | null): string {
  if (!date) return '-'
  return dateTimeFormatter.format(new Date(date))
}

export function formatPhone(phone: string | null): string {
  if (!phone) return '-'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}

export function formatPlate(plate: string | null): string {
  if (!plate) return '-'
  const upper = plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (upper.length === 7) {
    return `${upper.slice(0, 3)}-${upper.slice(3)}`
  }
  return upper
}

export function formatMileage(mileage: number | null): string {
  if (mileage == null) return '-'
  return new Intl.NumberFormat('pt-BR').format(mileage) + ' km'
}

export function getReminderTypeLabel(type: string | null): string {
  const labels: Record<string, string> = {
    service_due: 'Serviço Pendente',
    maintenance: 'Manutenção Preventiva',
    follow_up: 'Follow-up',
    custom: 'Personalizado',
  }
  return type ? labels[type] ?? type : '-'
}

export function getStatusLabel(status: string | null): string {
  const labels: Record<string, string> = {
    open: 'Aberto',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    expired: 'Expirado',
    paid: 'Pago',
    overdue: 'Vencido',
    scheduled: 'Agendado',
    sent: 'Enviado',
  }
  return status ? labels[status] ?? status : '-'
}
