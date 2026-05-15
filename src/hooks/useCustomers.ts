import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Customer } from '@/types'

export function useCustomers(search?: string, page = 1, limit = 10) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from('customers')
        .select('*, vehicles:vehicles(count)', { count: 'exact' })

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1
      const { data, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      if (data) {
        setCustomers(data.map((c: any) => ({ ...c, vehicle_count: c.vehicles?.[0]?.count || 0 })))
      }
      if (count !== null) setTotal(count)
      setLoading(false)
    }
    load()
  }, [search, page, limit])

  return { customers, total, loading }
}
