import { useEffect, useState } from 'react'
import { CheckCircle2, FileText, HeartHandshake, Search } from 'lucide-react'
import { welfareService } from '@/services/welfareService'
import type { WelfareRequest, WelfareStatus, User } from '@/types'
import { StatusBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { fmtDate } from '@/utils/format'

export default function WelfareRequests() {
  const [list, setList] = useState<WelfareRequest[]>([])
  const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const [q, setQ] = useState(''); const [statusFilter, setStatusFilter] = useState(''); const [typeFilter, setTypeFilter] = useState('')
  const [active, setActive] = useState<WelfareRequest | null>(null)
  const [note, setNote] = useState(''); const [pendingAction, setPendingAction] = useState<WelfareStatus | null>(null)
  const [busy, setBusy] = useState(false); const { toast } = useToast()

  const load = async () => {
    setLoading(true); setError('')
    try { setList(await welfareService.list({ status: statusFilter || undefined, type: typeFilter || undefined, q: q || undefined })) }
    catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [statusFilter, typeFilter])

  const doUpdate = async (status?: WelfareStatus) => {
    if (!active) return
    setBusy(true)
    try {
      const updated = await welfareService.update(active._id, { status, adminNote: note || undefined })
      setList((l) => l.map((x) => (x._id === updated._id ? updated : x)))
      setActive(updated); setPendingAction(null); setNote('')
      toast('success', status ? `Request ${status}` : 'Note saved')
    } catch (e) { toast('error', (e as Error).message) } finally { setBusy(false) }
  }

  const total = list.length
  const pending = list.filter((w) => w.status === 'Submitted' || w.status === 'Under Review').length
  const approved = list.filter((w) => w.status === 'Approved').length
  const rejected = list.filter((w) => w.status === 'Rejected').length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Student Welfare & Hardship Requests</h1>
        <p className="text-sm text-slate-500 mt-1"><HeartHandshake size={14} className="inline mr-1 text-brand-teal" />Confidential workspace — handle with care and discretion</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Mini label="Total Claims" value={total} /><Mini label="Pending Review" value={pending} />
        <Mini label="Approved" value={approved} /><Mini label="Rejected" value={rejected} />
      </div>

      <div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search ID, student name or ID…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
        </div>
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>{['Submitted', 'Under Review', 'Approved', 'Rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All aid categories</option>{['Fee Aid', 'Medical', 'Counseling', 'Emergency', 'Other'].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> :
          list.length === 0 ? <EmptyState title="No welfare requests match your filters" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr><th className="th">Request ID</th><th className="th">Student</th><th className="th">Aid Category</th><th className="th">Documents</th><th className="th">Status</th><th className="th">Submitted</th><th className="th"></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((w) => {
                  const student = typeof w.requestedBy === 'object' ? w.requestedBy as User : null
                  return (
                    <tr key={w._id} className="hover:bg-slate-50">
                      <td className="td font-mono text-xs">{w._id}</td>
                      <td className="td"><p className="text-sm font-medium">{student?.name || '—'}</p><p className="text-[10px] text-slate-400">{student?.studentId}</p></td>
                      <td className="td">{w.type}</td>
                      <td className="td">{w.documents?.length ? (<span className="text-xs text-brand-teal font-semibold flex items-center gap-1"><FileText size={12} /> {w.documents.length} file(s)</span>) : <span className="text-xs text-slate-400">None</span>}</td>
                      <td className="td"><StatusBadge status={w.status} /></td>
                      <td className="td text-xs text-slate-500">{fmtDate(w.createdAt)}</td>
                      <td className="td"><button className="text-xs font-semibold text-brand-teal hover:underline" onClick={() => { setActive(w); setNote(w.adminNote || '') }}>Review</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title="Welfare Request Details" size="lg"
        footer={active && (active.status === 'Submitted' || active.status === 'Under Review') ? (<>
          <button className="btn-secondary" onClick={() => doUpdate('Under Review')} disabled={busy}>Mark Under Review</button>
          <button className="btn-danger" onClick={() => setPendingAction('Rejected')} disabled={busy}>Reject</button>
          <button className="btn-primary" onClick={() => setPendingAction('Approved')} disabled={busy}><CheckCircle2 size={16} /> Approve</button>
        </>) : (<button className="btn-secondary" onClick={() => doUpdate()} disabled={busy}>Save Note</button>)}>
        {active && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="label">Student</p>{typeof active.requestedBy === 'object' ? (active.requestedBy as User).name : '—'}</div>
              <div><p className="label">Student ID</p>{typeof active.requestedBy === 'object' ? (active.requestedBy as User).studentId || '—' : '—'}</div>
              <div><p className="label">Aid Category</p>{active.type}</div>
              <div><p className="label">Submitted</p>{fmtDate(active.createdAt)}</div>
              <div><p className="label">Status</p><StatusBadge status={active.status} /></div>
              {active.amountRequested && <div><p className="label">Requested Amount</p>PKR {active.amountRequested.toLocaleString()}</div>}
            </div>
            <div><p className="label">Request Details</p><p className="text-sm text-slate-700 whitespace-pre-wrap">{active.details}</p></div>
            <div>
              <label className="label">Administrative Note</label>
              <textarea className="input h-24 py-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes visible to administrators only…" />
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!pendingAction} onClose={() => setPendingAction(null)} title={`Confirm ${pendingAction}`} size="sm" footer={<>
        <button className="btn-secondary" onClick={() => setPendingAction(null)}>Cancel</button>
        <button className={pendingAction === 'Rejected' ? 'btn-danger' : 'btn-primary'} disabled={busy} onClick={() => doUpdate(pendingAction || undefined)}>{busy ? 'Saving…' : `Confirm ${pendingAction}`}</button>
      </>}>
        <p className="text-sm text-slate-600">Are you sure you want to mark this welfare request as <strong>{pendingAction}</strong>?</p>
      </Modal>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className="text-2xl font-heading font-semibold mt-1">{value}</p>
    </div>
  )
}