import { AlertTriangle } from 'lucide-react'
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-brand-red mb-3"><AlertTriangle size={22} /></div>
      <p className="font-heading font-semibold text-slate-800">Unable to load data</p>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{message}</p>
      {onRetry && <button className="btn-secondary mt-4" onClick={onRetry}>Try again</button>}
    </div>
  )
}