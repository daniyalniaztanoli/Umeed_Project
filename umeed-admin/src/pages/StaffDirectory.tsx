import { useEffect, useState, FormEvent } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { staffService } from '@/services/staffService'
import type { User } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { initials } from '@/utils/format'

export default function StaffDirectory() {
  const { toast } = useToast()
  const [list, setList] = useState<User[]>([])
  const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const [q, setQ] = useState(''); const [addOpen, setAddOpen] = useState(false); const [busy, setBusy] = useState(false)
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [department, setDepartment] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { setList(await staffService.list()) } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !department) { toast('error', 'All fields are required'); return }
    setBusy(true)
    try {
      await staffService.create({ name, email, password, department })
      toast('success', 'Staff member added'); setAddOpen(false); setName(''); setEmail(''); setPassword(''); setDepartment(''); load()
    } catch (e) { toast('error', (e as Error).message) } finally { setBusy(false) }
  }

  const filtered = q ? list.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase()) || s.department?.toLowerCase().includes(q.toLowerCase())) : list

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Staff & Departmental Triage Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage staff accounts used for complaint assignment.</p>
        </div>
        <button className="btn-primary" onClick={() => setAddOpen(true)}><Plus size={16} /> Add Staff Member</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Stat label="Total Staff" value={list.length} /><Stat label="Active" value={list.filter((s) => !s.isBlocked).length} />
        <Stat label="On Duty" value="—" hint="No duty API yet" /><Stat label="Departments" value={new Set(list.map((s) => s.department)).size} />
      </div>

      <div className="card p-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search by name, email, or department…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> :
          filtered.length === 0 ? <EmptyState title="No staff members yet" icon={<Users />} /> :
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr><th className="th">Staff Member</th><th className="th">Staff ID</th><th className="th">Department</th><th className="th">Email</th><th className="th">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-teal/10 text-brand-teal flex items-center justify-center text-xs font-semibold">{initials(s.name)}</div>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td className="td font-mono text-xs">{s._id}</td>
                    <td className="td">{s.department || '—'}</td>
                    <td className="td text-slate-600">{s.email}</td>
                    <td className="td">{s.isBlocked ? <span className="badge bg-red-50 text-brand-red border border-red-200">Blocked</span> : <span className="badge bg-green-50 text-brand-green border border-green-200">Active</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Staff Member" size="md" footer={<>
        <button className="btn-secondary" onClick={() => setAddOpen(false)}>Cancel</button>
        <button className="btn-primary" disabled={busy} onClick={submit}>{busy ? 'Creating…' : 'Create Staff Account'}</button>
      </>}>
        <form onSubmit={submit} className="space-y-3">
          <div><label className="label">Full Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label className="label">Temporary Password</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div><label className="label">Department</label><input className="input" value={department} onChange={(e) => setDepartment(e.target.value)} required /></div>
        </form>
      </Modal>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className="text-2xl font-heading font-semibold mt-1">{value}</p>
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}