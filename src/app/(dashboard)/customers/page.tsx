"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { CustomerTable } from "@/components/customers/CustomerTable"
import { CustomerForm } from "@/components/customers/CustomerForm"

export default function CustomersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <CustomerForm onSuccess={() => setPage(1)} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <CustomerTable search={search} page={page} onPageChange={setPage} />
    </div>
  )
}
