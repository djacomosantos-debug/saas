"use client"

import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useVehicles } from "@/hooks/useVehicles"
import { formatPlate, formatMileage } from "@/utils/formatters"

interface VehicleTableProps {
  customerId?: string
  search?: string
}

export function VehicleTable({ customerId, search }: VehicleTableProps) {
  const { vehicles, loading } = useVehicles(customerId, search)

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium">Nenhum veículo encontrado</p>
        <p className="text-sm">
          {search ? "Tente ajustar sua busca." : "Cadastre seu primeiro veículo."}
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Placa</TableHead>
          <TableHead>Marca</TableHead>
          <TableHead>Modelo</TableHead>
          <TableHead>Ano</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Km</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.id}>
            <TableCell>
              <Link href={`/vehicles/${vehicle.id}`} className="font-medium hover:underline">
                {formatPlate(vehicle.plate)}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{vehicle.brand || '-'}</TableCell>
            <TableCell className="text-muted-foreground">{vehicle.model || '-'}</TableCell>
            <TableCell className="text-muted-foreground">{vehicle.year ?? '-'}</TableCell>
            <TableCell className="text-muted-foreground">
              {(vehicle as any).customer?.name || '-'}
            </TableCell>
            <TableCell className="text-muted-foreground">{formatMileage(vehicle.current_mileage)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
