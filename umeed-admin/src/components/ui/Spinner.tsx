export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500 text-sm">
      <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-brand-green animate-spin" />
      {label}
    </div>
  )
}