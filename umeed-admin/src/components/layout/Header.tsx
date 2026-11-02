import { useState } from 'react'
import { Bell, Menu, LogOut, Search, User as UserIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { initials } from '@/utils/format'

export function Header({ onMenuClick, onSearch }: { onMenuClick: () => void; onSearch?: (q: string) => void }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [menu, setMenu] = useState(false)
  const [q, setQ] = useState('')

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-3 sticky top-0 z-20">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100"><Menu size={20} /></button>
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9 bg-slate-50 border-transparent focus:bg-white" placeholder="Search complaints, users, staff…" value={q}
          onChange={(e) => { setQ(e.target.value); onSearch?.(e.target.value) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) nav(`/complaints?q=${encodeURIComponent(q)}`) }} />
      </div>
      <div className="flex-1" />
      <button className="p-2 rounded-lg hover:bg-slate-100 relative" title="Notifications">
        <Bell size={18} className="text-slate-600" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-amber" />
      </button>
      <div className="relative">
        <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100">
          <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-xs font-semibold">{initials(user?.name)}</div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Administrator</p>
          </div>
        </button>
        {menu && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><UserIcon size={16} /> Profile</button>
            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-brand-red hover:bg-red-50" onClick={() => { logout(); nav('/login') }}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}