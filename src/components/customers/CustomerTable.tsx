"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomers } from "@/hooks/useCustomers"
import { formatPhone, formatDate } from "@/utils/formatters"
import { Button } from "@/components/ui/button"

interface CustomerTableProps {
  search?: string
  page: number
  limit?: number
  onPageChange: (page: number) => void
}

export function CustomerTable({ search, page, limit = 10, onPageChange }: CustomerTableProps) {
  const { customers, total, loading } = useCustomers(search, page, limit)
  const totalPages = Math.ceil(total / limit)

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium">Nenhum cliente encontrado</p>
        <p className="text-sm">
          {search ? "Tente ajustar sua busca." : "Cadastre seu primeiro cliente."}
        </p>
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Veículos</TableHead>
            <TableHead>Desde</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <Link href={`/customers/${customer.id}`} className="font-medium hover:underline">
                  {customer.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatPhone(customer.phone)}</TableCell>
              <TableCell className="text-muted-foreground">{customer.email || '-'}</TableCell>
              <TableCell className="text-center">{customer.vehicle_count ?? 0}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(customer.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-2 py-4">
          <p className="text-sm text-muted-foreground">
            {total} cliente{total !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
