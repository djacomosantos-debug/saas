import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Vehicle } from '@/types'

export function useVehicles(customerId?: string, search?: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('vehicles')
        .select('*, customer:customers(*)')

      if (customerId) {
        query = query.eq('customer_id', customerId)
      }
      if (search) {
        query = query.or(`plate.ilike.%${search}%,model.ilike.%${search}%`)
      }

      const { data } = await query.order('created_at', { ascending: false })

      if (data) setVehicles(data)
      setLoading(false)
    }
    load()
  }, [customerId, search])

  return { vehicles, loading }
}
