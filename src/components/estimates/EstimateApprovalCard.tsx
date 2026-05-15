import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/formatters'
import type { Estimate, EstimateItem } from '@/types'

interface EstimateApprovalCardProps {
  estimate: Estimate
  onApprove: () => void
  onReject: () => void
}

export function EstimateApprovalCard({ estimate, onApprove, onReject }: EstimateApprovalCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamento #{estimate.id.slice(0, 8)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {estimate.items.map((item: EstimateItem) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.description} x{item.quantity}</span>
              <span>{formatCurrency(item.unit_price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-2 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatCurrency(estimate.total_amount || 0)}</span>
        </div>
        {estimate.status === 'pending' && (
          <div className="flex gap-2">
            <Button onClick={onApprove} className="flex-1">Aprovar Orçamento</Button>
            <Button onClick={onReject} variant="outline" className="flex-1">Solicitar Alteração</Button>
          </div>
        )}
        {estimate.status === 'approved' && (
          <p className="text-green-500 text-center font-medium">Orçamento aprovado!</p>
        )}
        {estimate.status === 'rejected' && (
          <p className="text-red-500 text-center font-medium">Orçamento rejeitado</p>
        )}
      </CardContent>
    </Card>
  )
}
