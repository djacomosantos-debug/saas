"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VehicleTable } from "@/components/vehicles/VehicleTable"
import { VehicleForm } from "@/components/vehicles/VehicleForm"
import { createClient } from "@/lib/supabase/client"
export default function VehiclesPage() {
  const [search, setSearch] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("customers").select("id, name").order("name")
      if (data) setCustomers(data)
    }
    load()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Veículos</h1>
        <VehicleForm />
      </div>

      <div className="flex gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar placa ou modelo..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={customerId} onValueChange={setCustomerId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <VehicleTable customerId={customerId === "all" || customerId === "" ? undefined : customerId} search={search} />
    </div>
  )
}
