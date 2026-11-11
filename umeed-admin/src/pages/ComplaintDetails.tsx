import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Image as ImageIcon, MapPin, User as UserIcon } from 'lucide-react'
import { complaintService } from '@/services/complaintService'
import { staffService } from '@/services/staffService'
import type { Complaint, ComplaintStatus, User } from '@/types'
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { fmtDateTime } from '@/utils/format'

export default function ComplaintDetails() {
  const { id = '' } = useParams(); const nav = useNavigate(); const { toast } = useToast()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const [assignOpen, setAssignOpen] = useState(false); const [selectedStaff, setSelectedStaff] = useState('')
  const [statusOpen, setStatusOpen] = useState<ComplaintStatus | null>(null)
  const [statusNote, setStatusNote] = useState(''); const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [c, s] = await Promise.all([complaintService.get(id), staffService.list()])
      setComplaint(c); setStaff(s)
      setSelectedStaff(typeof c.assignedTo === 'object' ? c.assignedTo?._id || '' : (c.assignedTo as string) || '')
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [id])

  const doAssign = async () => {
    if (!selectedStaff) return
    setBusy(true)
    try { const c = await complaintService.assign(id, selectedStaff); setComplaint(c); setAssignOpen(false); toast('success', 'Staff assigned successfully') }
    catch (e) { toast('error', (e as Error).message) } finally { setBusy(false) }
  }
  const doStatus = async () => {
    if (!statusOpen) return
    setBusy(true)
    try { const c = await complaintService.updateStatus(id, statusOpen, statusNote || undefined); setComplaint(c); setStatusOpen(null); setStatusNote(''); toast('success', `Status updated to ${statusOpen}`) }
    catch (e) { toast('error', (e as Error).message) } finally { setBusy(false) }
  }

  if (loading) return <Spinner />
  if (error || !complaint) return <ErrorState message={error || 'Complaint not found'} onRetry={load} />

  const reporter = typeof complaint.reportedBy === 'object' ? complaint.reportedBy : null
  const assignee = complaint.assignedTo && typeof complaint.assignedTo === 'object' ? complaint.assignedTo : null

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/complaints" className="hover:underline">Queue</Link><span>/</span>
        <span>Complaints</span><span>/</span>
        <span className="font-mono">{complaint._id}</span><span>/</span>
        <span className="text-slate-700">{complaint.title}</span>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button onClick={() => nav('/complaints')} className="btn-ghost"><ArrowLeft size={16} /> Back</button>
          <div>
            <h1 className="font-heading text-xl font-semibold">{complaint.title}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
              <span className="text-xs text-slate-500 font-mono">{complaint._id}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setStatusOpen('Rejected')}>Reject</button>
          <button className="btn-primary" onClick={() => setStatusOpen('Resolved')}><CheckCircle2 size={16} /> Mark Resolved</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-slate-800 mb-3">Complaint Description</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
              <Field label="Category" value={complaint.category} />
              <Field label="Building" value={complaint.location?.building || '—'} />
              <Field label="Room" value={complaint.location?.room || '—'} />
              <Field label="Submitted" value={fmtDateTime(complaint.createdAt)} />
            </div>
            {complaint.images && complaint.images.length > 0 && (
              <div className="mt-4">
                <p className="label">Attachments</p>
                <div className="grid grid-cols-3 gap-2">
                  {complaint.images.map((img, i) => (
                    <a key={i} href={img.url} target="_blank" rel="noreferrer" className="aspect-video bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:border-brand-green"><ImageIcon size={20} /></a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-slate-800 mb-3">Case Timeline</h2>
            <ol className="relative border-l border-slate-200 ml-2 space-y-4 pl-5">
              {complaint.timeline.map((ev, i) => (
                <li key={i}>
                  <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-brand-green" />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{ev.status}</p>
                    <p className="text-xs text-slate-500">{fmtDateTime(ev.at)}</p>
                  </div>
                  {ev.note && <p className="text-xs text-slate-600 mt-0.5">{ev.note}</p>}
                  {ev.by && <p className="text-[11px] text-slate-400 mt-0.5">by {ev.by}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-slate-800 mb-3 flex items-center gap-2"><UserIcon size={16} /> Reporter</h2>
            <p className="text-sm font-medium">{reporter?.name || '—'}</p>
            <p className="text-xs text-slate-500">{reporter?.email}</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <Field label="Student ID" value={reporter?.studentId || '—'} />
              <Field label="Department" value={reporter?.department || '—'} />
            </div>
          </div>
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-slate-800 mb-3">Assigned Staff</h2>
            {assignee ? (<>
              <p className="text-sm font-medium">{assignee.name}</p>
              <p className="text-xs text-slate-500">{assignee.department}</p>
              <p className="text-xs text-slate-500 mt-1">{assignee.email}</p>
            </>) : <p className="text-sm text-slate-500">Not yet assigned</p>}
            <button className="btn-secondary w-full mt-3" onClick={() => setAssignOpen(true)}>{assignee ? 'Reassign Staff' : 'Assign Staff'}</button>
          </div>
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-slate-800 mb-3">Location</h2>
            <div className="flex items-start gap-2 text-sm text-slate-700">
              <MapPin size={14} className="mt-0.5 text-slate-400" />
              <span>{complaint.location?.text || [complaint.location?.building, complaint.location?.room].filter(Boolean).join(', ') || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Staff" size="sm" footer={<>
        <button className="btn-secondary" onClick={() => setAssignOpen(false)}>Cancel</button>
        <button className="btn-primary" disabled={!selectedStaff || busy} onClick={doAssign}>{busy ? 'Saving…' : 'Confirm Assignment'}</button>
      </>}>
        <select className="input" value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
          <option value="">Choose staff member…</option>
          {staff.map((s) => <option key={s._id} value={s._id}>{s.name} — {s.department}</option>)}
        </select>
      </Modal>

      <Modal open={!!statusOpen} onClose={() => setStatusOpen(null)} title={`Change Status → ${statusOpen}`} size="sm" footer={<>
        <button className="btn-secondary" onClick={() => setStatusOpen(null)}>Cancel</button>
        <button className="btn-primary" disabled={busy} onClick={doStatus}>{busy ? 'Saving…' : 'Confirm'}</button>
      </>}>
        <label className="label">Administrative note (optional)</label>
        <textarea className="input h-24 py-2" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Reason or resolution summary…" />
      </Modal>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
      <p className="text-slate-700 mt-0.5">{value}</p>
    </div>
  )
}