import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { ServiceOrder } from '@/types'

export function useServiceOrders(filters?: {
  status?: string
  customer_id?: string
  vehicle_id?: string
  date_from?: string
  date_to?: string
}) {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('service_orders')
        .select('*, customer:customers(*), vehicle:vehicles(*)')

      if (filters?.status) query = query.eq('status', filters.status)
      if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id)
      if (filters?.vehicle_id) query = query.eq('vehicle_id', filters.vehicle_id)
      if (filters?.date_from) query = query.gte('created_at', filters.date_from)
      if (filters?.date_to) query = query.lte('created_at', filters.date_to)

      const { data } = await query.order('created_at', { ascending: false })

      if (data) setOrders(data)
      setLoading(false)
    }
    load()
  }, [filters])

  return { orders, loading }
}
