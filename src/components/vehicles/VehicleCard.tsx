import type { Vehicle } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMileage } from '@/utils/formatters'
import { Car, Gauge } from 'lucide-react'

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          {vehicle.plate}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
        <p className="text-sm text-muted-foreground">Motor: {vehicle.engine} | Combustível: {vehicle.fuel}</p>
        {vehicle.current_mileage && (
          <p className="text-sm flex items-center gap-1">
            <Gauge className="h-4 w-4" />
            {formatMileage(vehicle.current_mileage)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
