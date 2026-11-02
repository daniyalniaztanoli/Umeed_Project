import { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card p-5', className)}>{children}</div>
}

export function StatCard({ label, value, icon: Icon, tone = 'green', hint }: { label: string; value: string | number; icon: LucideIcon; tone?: 'green' | 'teal' | 'amber' | 'red' | 'slate'; hint?: string }) {
  const tones = {
    green: 'bg-green-50 text-brand-green',
    teal: 'bg-teal-50 text-brand-teal',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-brand-red',
    slate: 'bg-slate-100 text-slate-700',
  }
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-heading font-semibold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', tones[tone])}><Icon size={20} /></div>
      </div>
    </div>
  )
}