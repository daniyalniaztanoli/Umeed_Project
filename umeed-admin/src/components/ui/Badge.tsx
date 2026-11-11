import { ComplaintStatus, ComplaintPriority, WelfareStatus } from '@/types'
import { cn } from '@/utils/cn'

export function StatusBadge({ status }: { status: ComplaintStatus | WelfareStatus | string }) {
  const map: Record<string, string> = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    'In Progress': 'bg-teal-50 text-brand-teal border-teal-200',
    Resolved: 'bg-green-50 text-brand-green border-green-200',
    Rejected: 'bg-red-50 text-brand-red border-red-200',
    Submitted: 'bg-amber-50 text-amber-700 border-amber-200',
    'Under Review': 'bg-teal-50 text-brand-teal border-teal-200',
    Approved: 'bg-green-50 text-brand-green border-green-200',
  }
  return <span className={cn('badge border', map[status] || 'bg-slate-100 text-slate-700 border-slate-200')}>{status}</span>
}

export function PriorityBadge({ priority }: { priority: ComplaintPriority }) {
  const map: Record<string, string> = {
    High: 'bg-red-50 text-brand-red border-red-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-slate-100 text-slate-600 border-slate-200',
  }
  return <span className={cn('badge border', map[priority] || map.Low)}>{priority}</span>
}