import { NavLink } from 'react-router-dom'
import { LayoutDashboard, AlertCircle, HeartHandshake, Megaphone, Users, ShieldCheck, BarChart3, Sprout } from 'lucide-react'
import { cn } from '@/utils/cn'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/complaints', label: 'Complaint Queue', icon: AlertCircle },
  { to: '/welfare', label: 'Welfare Requests', icon: HeartHandshake },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/staff', label: 'Staff & Depts', icon: Users },
  { to: '/users', label: 'Users', icon: ShieldCheck },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={cn('fixed z-40 inset-y-0 left-0 w-64 bg-brand-ink text-slate-300 flex flex-col transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-brand-green flex items-center justify-center text-white"><Sprout size={20} /></div>
          <div>
            <p className="font-heading text-white font-semibold leading-none">Umeed</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">Admin Portal</p>
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-brand-green/15 text-white border-l-2 border-brand-green' : 'text-slate-400 hover:text-white hover:bg-white/5')}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Institutional Triage</p>
          <p className="text-xs text-slate-500 mt-1">Umeed v1.0 · MVP</p>
        </div>
      </aside>
    </>
  )
}