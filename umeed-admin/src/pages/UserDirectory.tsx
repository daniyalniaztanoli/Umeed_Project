import { useEffect, useState } from 'react'
import { Ban, CheckCircle2, Search, ShieldCheck } from 'lucide-react'
import { userService } from '@/services/userService'
import type { User } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { initials } from '@/utils/format'

type Tab = 'all' | 'student' | 'staff' | 'admin' | 'blocked'

export default function UserDirectory() {
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('all')
  const [list, setList] = useState<User[]>([])
  const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const [q, setQ] = useState(''); const [confirmUser, setConfirmUser] = useState<User | null>(null); const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const params: { role?: string; blocked?: boolean; q?: string } = {}
      if (tab === 'student') params.role = 'student'
      else if (tab === 'staff') params.role = 'staff'
      else if (tab === 'admin') params.role = 'admin'
      else if (tab === 'blocked') params.blocked = true
      if (q) params.q = q
      setList(await userService.list(params))
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [tab])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [q])

  const doToggle = async () => {
    if (!confirmUser) return
    setBusy(true)
    try {
      await userService.setBlocked(confirmUser._id, !confirmUser.isBlocked)
      toast('success', `User ${confirmUser.isBlocked ? 'unblocked' : 'blocked'}`)
      setConfirmUser(null); load()
    } catch (e) { toast('error', (e as Error).message) } finally { setBusy(false) }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Users' }, { key: 'student', label: 'Students' }, { key: 'staff', label: 'Staff' },
    { key: 'admin', label: 'Administrators' }, { key: 'blocked', label: 'Blocked' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">User Directory & Access Control</h1>
        <p className="text-sm text-slate-500 mt-1">Manage authenticated students, staff, and administrator accounts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Stat label="Enrolled Students" value={list.filter((u) => u.role === 'student').length} />
        <Stat label="Staff & Admins" value={list.filter((u) => u.role === 'staff' || u.role === 'admin').length} />
        <Stat label="Suspended / Blocked" value={list.filter((u) => u.isBlocked).length} />
        <Stat label="Total Listed" value={list.length} />
      </div>

      <div className="card">
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${tab === t.key ? 'bg-brand-green/10 text-brand-green' : 'text-slate-600 hover:bg-slate-50'}`}>{t.label}</button>
          ))}
        </div>
        <div className="p-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search by name, email, or student ID…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> :
          list.length === 0 ? <EmptyState title="No users match your filters" icon={<ShieldCheck />} /> :
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="th">User</th><th className="th">Email</th><th className="th">Role</th>
                  <th className="th">Department</th><th className="th">Status</th><th className="th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold">
                          {initials(u.name)}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          {u.studentId && <p className="text-[10px] text-slate-400">{u.studentId}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="td text-slate-600">{u.email}</td>
                    <td className="td">
                      <span className="badge bg-slate-100 text-slate-700 border border-slate-200 capitalize">{u.role}</span>
                    </td>
                    <td className="td">{u.department || '—'}</td>
                    <td className="td">
                      {u.isBlocked
                        ? <span className="badge bg-red-50 text-brand-red border border-red-200">Blocked</span>
                        : <span className="badge bg-green-50 text-brand-green border border-green-200">Active</span>}
                    </td>
                    <td className="td">
                      <button className="text-xs font-semibold text-brand-teal hover:underline inline-flex items-center gap-1"
                        onClick={() => setConfirmUser(u)}>
                        {u.isBlocked ? <><CheckCircle2 size={12}/> Unblock</> : <><Ban size={12}/> Block</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>

      <Modal open={!!confirmUser} onClose={() => setConfirmUser(null)}
        title={confirmUser?.isBlocked ? 'Unblock Account' : 'Block Account'} size="sm"
        footer={<>
          <button className="btn-secondary" onClick={() => setConfirmUser(null)}>Cancel</button>
          <button className={confirmUser?.isBlocked ? 'btn-primary' : 'btn-danger'} disabled={busy} onClick={doToggle}>
            {busy ? 'Saving…' : (confirmUser?.isBlocked ? 'Unblock' : 'Block')}
          </button>
        </>}>
        <p className="text-sm text-slate-600">
          Are you sure you want to {confirmUser?.isBlocked ? 'unblock' : 'block'}{' '}
          <strong>{confirmUser?.name}</strong>?
        </p>
      </Modal>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className="text-2xl font-heading font-semibold mt-1">{value}</p>
    </div>
  )
}