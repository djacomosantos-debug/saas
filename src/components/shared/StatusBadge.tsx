import { Badge } from '@/components/ui/badge'
import { getStatusLabel } from '@/utils/formatters'

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  completed: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  cancelled: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  pending: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
  approved: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  paid: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  overdue: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  scheduled: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  sent: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  failed: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={statusColors[status] || ''}>
      {getStatusLabel(status)}
    </Badge>
  )
}
