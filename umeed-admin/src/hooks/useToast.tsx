import { createContext, useCallback, useContext, useState, ReactNode } from 'react'
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
interface Toast { id: string; type: ToastType; message: string }
const Ctx = createContext<{ toast: (t: ToastType, m: string) => void } | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, type, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-start gap-3 min-w-[280px] max-w-md bg-white border rounded-xl shadow-lg px-4 py-3 text-sm ${t.type === 'success' ? 'border-green-200' : t.type === 'error' ? 'border-red-200' : 'border-slate-200'}`}>
            {t.type === 'success' ? <CheckCircle2 className="text-brand-green mt-0.5" size={18} /> :
              t.type === 'error' ? <AlertTriangle className="text-brand-red mt-0.5" size={18} /> :
              <Info className="text-brand-teal mt-0.5" size={18} />}
            <p className="flex-1 text-slate-700">{t.message}</p>
            <button onClick={() => setToasts((s) => s.filter((x) => x.id !== t.id))}><X size={16} className="text-slate-400" /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useToast outside ToastProvider')
  return c
}