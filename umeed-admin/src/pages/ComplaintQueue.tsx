import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, RefreshCw, Search, X, Download } from 'lucide-react'
import { complaintService, ComplaintQuery } from '@/services/complaintService'
import { staffService } from '@/services/staffService'
import type { Complaint, Paginated, User, ComplaintStatus } from '@/types'
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { timeAgo } from '@/utils/format'

const CATEGORIES = ['Facilities', 'Cleanliness', 'Hostel', 'Safety', 'Academic', 'Other']
const STATUSES: ComplaintStatus[] = ['Pending', 'In Progress', 'Resolved', 'Rejected']
const PRIORITIES = ['Low', 'Medium', 'High']

export default function ComplaintQueue() {
  const [params, setParams] = useSearchParams()
  const [data, setData] = useState<Paginated<Complaint> | null>(null)
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignStaffId, setAssignStaffId] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const { toast } = useToast()

  const filters: ComplaintQuery = useMemo(() => ({
    status: params.get('status') || undefined, category: params.get('category') || undefined,
    priority: params.get('priority') || undefined, q: params.get('q') || undefined,
    page: Number(params.get('page') || 1), limit: 10,
  }), [params])

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [c, s] = await Promise.all([complaintService.list(filters), staffService.list()])
      setData(c); setStaff(s)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [params])

  const setFilter = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v); else next.delete(k)
    if (k !== 'page') next.delete('page')
    setParams(next)
  }
  const clearAll = () => setParams(new URLSearchParams())

  const toggle = (id: string) => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s) }
  const toggleAll = () => { if (!data) return; if (selected.size === data.data.length) setSelected(new Set()); else setSelected(new Set(data.data.map((c) => c._id))) }

  const bulkAssign = async () => {
    if (!assignStaffId) return
    setAssignLoading(true)
    try {
      await Promise.all(Array.from(selected).map((id) => complaintService.assign(id, assignStaffId)))
      toast('success', `Assigned ${selected.size} complaint(s)`)
      setAssignOpen(false); setSelected(new Set()); setAssignStaffId(''); load()
    } catch (e) { toast('error', (e as Error).message) } finally { setAssignLoading(false) }
  }
  const bulkStatus = async (status: ComplaintStatus) => {
    try {
      await Promise.all(Array.from(selected).map((id) => complaintService.updateStatus(id, status, 'Bulk status update')))
      toast('success', `Updated ${selected.size} complaint(s)`)
      setSelected(new Set()); load()
    } catch (e) { toast('error', (e as Error).message) }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Complaint Queue & Case Management</h1>
          <p className="text-sm text-slate-500 mt-1">Live triage engine — assign, track, resolve</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={load}><RefreshCw size={16} /> Refresh</button>
          <button className="btn-secondary" disabled title="Export is a planned feature"><Download size={16} /> Export CSV <span className="text-[10px] text-slate-400 ml-1">(planned)</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="Open Pending" value={data?.data.filter((c) => c.status === 'Pending').length || 0} />
        <MiniStat label="In Progress" value={data?.data.filter((c) => c.status === 'In Progress').length || 0} />
        <MiniStat label="This Page" value={data?.data.length || 0} />
        <MiniStat label="Total Filtered" value={data?.total || 0} />
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Filter size={14} /> <span className="font-semibold uppercase tracking-wider">Filters</span>
          <button onClick={clearAll} className="ml-auto text-brand-teal font-semibold hover:underline">Clear All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search ID, title, reporter…" value={params.get('q') || ''} onChange={(e) => setFilter('q', e.target.value)} />
          </div>
          <select className="input" value={params.get('status') || ''} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input" value={params.get('category') || ''} onChange={(e) => setFilter('category', e.target.value)}>
            <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" value={params.get('priority') || ''} onChange={(e) => setFilter('priority', e.target.value)}>
            <option value="">All priorities</option>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="card p-3 bg-brand-green/5 border-brand-green/20 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-700 font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <button className="btn-secondary" onClick={() => setAssignOpen(true)}>Assign Staff</button>
          <button className="btn-secondary" onClick={() => bulkStatus('In Progress')}>Mark In Progress</button>
          <button className="btn-secondary" onClick={() => bulkStatus('Resolved')}>Mark Resolved</button>
          <button className="btn-ghost" onClick={() => setSelected(new Set())}><X size={16} /></button>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> :
          !data || data.data.length === 0 ? <EmptyState title="No complaints match your filters" description="Try clearing filters or searching differently." /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="th w-10"><input type="checkbox" checked={selected.size === data.data.length && data.data.length > 0} onChange={toggleAll} /></th>
                    <th className="th">ID</th><th className="th">Title & Context</th><th className="th">Category</th><th className="th">Priority</th>
                    <th className="th">Reporter</th><th className="th">Assigned</th><th className="th">Submitted</th><th className="th">Status</th><th className="th"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((c) => {
                    const reporter = typeof c.reportedBy === 'object' ? c.reportedBy : null
                    const assignee = c.assignedTo && typeof c.assignedTo === 'object' ? c.assignedTo : null
                    return (
                      <tr key={c._id} className="hover:bg-slate-50">
                        <td className="td"><input type="checkbox" checked={selected.has(c._id)} onChange={() => toggle(c._id)} /></td>
                        <td className="td font-mono text-xs whitespace-nowrap">{c._id}</td>
                        <td className="td max-w-[240px]">
                          <p className="font-medium text-slate-800 truncate">{c.title}</p>
                          <p className="text-xs text-slate-500 truncate">{c.description}</p>
                        </td>
                        <td className="td whitespace-nowrap">{c.category}</td>
                        <td className="td"><PriorityBadge priority={c.priority} /></td>
                        <td className="td whitespace-nowrap">
                          <p className="text-sm">{reporter?.name || '—'}</p>
                          <p className="text-[10px] text-slate-400">{reporter?.studentId}</p>
                        </td>
                        <td className="td whitespace-nowrap text-sm">{assignee?.name || <span className="text-slate-400">Unassigned</span>}</td>
                        <td className="td text-xs text-slate-500 whitespace-nowrap">{timeAgo(c.createdAt)}</td>
                        <td className="td"><StatusBadge status={c.status} /></td>
                        <td className="td"><Link to={`/complaints/${c._id}`} className="text-xs font-semibold text-brand-teal hover:underline">View</Link></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm">
              <p className="text-slate-500">Page {data.page} of {data.totalPages} · {data.total} complaints</p>
              <div className="flex gap-2">
                <button disabled={data.page <= 1} className="btn-secondary" onClick={() => setFilter('page', String(data.page - 1))}>Previous</button>
                <button disabled={data.page >= data.totalPages} className="btn-secondary" onClick={() => setFilter('page', String(data.page + 1))}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Staff" size="sm" footer={<>
        <button className="btn-secondary" onClick={() => setAssignOpen(false)}>Cancel</button>
        <button className="btn-primary" disabled={!assignStaffId || assignLoading} onClick={bulkAssign}>{assignLoading ? 'Assigning…' : 'Assign'}</button>
      </>}>
        <p className="text-sm text-slate-600 mb-3">Assign {selected.size} complaint(s) to a staff member:</p>
        <select className="input" value={assignStaffId} onChange={(e) => setAssignStaffId(e.target.value)}>
          <option value="">Choose staff member…</option>
          {staff.map((s) => <option key={s._id} value={s._id}>{s.name} — {s.department}</option>)}
        </select>
      </Modal>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className="text-2xl font-heading font-semibold mt-1">{value}</p>
    </div>
  )
}