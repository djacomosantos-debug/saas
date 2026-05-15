import { useEffect, useState, useRef } from 'react'
import type { ServiceOrder } from '@/types'

export function useServiceOrders(filters?: {
  status?: string
  customer_id?: string
  vehicle_id?: string
  date_from?: string
  date_to?: string
  customerSearch?: string
}) {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)

  const key = JSON.stringify(filters ?? {})

  useEffect(() => {
    let aborted = false
    async function load() {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.date_from) params.set('date_from', filters.date_from)
      if (filters?.date_to) params.set('date_to', filters.date_to)
      if (filters?.customerSearch) params.set('customerSearch', filters.customerSearch)
      params.set('limit', '50')

      const res = await fetch(`/api/service-orders?${params}`)
      const data = await res.json()
      if (!aborted) {
        setOrders(data.orders || [])
        setLoading(false)
      }
    }
    load()
    return () => { aborted = true }
  }, [key])

  return { orders, loading }
}
