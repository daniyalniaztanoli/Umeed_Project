import { useEffect, useState, FormEvent } from 'react'
import { Megaphone, Plus, Trash2, Eye } from 'lucide-react'
import { announcementService } from '@/services/announcementService'
import type { Announcement, AnnouncementCategory } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/hooks/useToast'
import { fmtDate } from '@/utils/format'

const CATS: AnnouncementCategory[] = ['General', 'Academic', 'Event', 'Emergency', 'Facilities']

export default function Announcements() {
  const { toast } = useToast()
  const [list, setList] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const [compose, setCompose] = useState(false); const [preview, setPreview] = useState<Announcement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null); const [busy, setBusy] = useState(false)
  const [title, setTitle] = useState(''); const [body, setBody] = useState(''); const [category, setCategory] = useState<AnnouncementCategory>('General')
  const [filterCat, setFilterCat] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { setList(await announcementService.list()) } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) { toast('error', 'Title and body are required'); return }
    setBusy(true)
    try {
      await announcementService.create({ title: title.trim(), body: body.trim(), category })
      toast('success', 'Announcement published'); setCompose(false); setTitle(''); setBody(''); setCategory('General'); load()
    } catch (e) { toast('error', (e as Error).message) } finally { setBusy(false) }
  }
  const doDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try { await announcementService.remove(deleteTarget._id); toast('success', 'Announcement deleted'); setDeleteTarget(null); load() }
    catch (e) { toast('error', (e as Error).message) } finally { setBusy(false) }
  }

  const filtered = filterCat ? list.filter((a) => a.category === filterCat) : list

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Campus Broadcasts & Official Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage official notices surfaced to students in the Umeed mobile app.</p>
        </div>
        <button className="btn-primary" onClick={() => setCompose(true)}><Plus size={16} /> Compose Announcement</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Stat label="Total Published" value={list.length} />
        <Stat label="Categories" value={new Set(list.map((a) => a.category)).size} />
        <Stat label="Recent (7d)" value={list.filter((a) => Date.now() - new Date(a.createdAt).getTime() < 7 * 864e5).length} />
        <Stat label="Read Rate" value="N/A" hint="Future enhancement" />
      </div>

      <div className="flex items-center gap-2">
        <select className="input max-w-xs" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All categories</option>{CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={load} /> :
          filtered.length === 0 ? <EmptyState title="No announcements yet" description="Compose your first campus broadcast." /> :
          <ul className="divide-y divide-slate-100">
            {filtered.map((a) => (
              <li key={a._id} className="p-5 flex items-start gap-4 hover:bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0"><Megaphone size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{a.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.body}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button className="p-1.5 rounded hover:bg-slate-100" onClick={() => setPreview(a)} title="Preview"><Eye size={14} className="text-slate-500" /></button>
                      <button className="p-1.5 rounded hover:bg-red-50" onClick={() => setDeleteTarget(a)} title="Delete"><Trash2 size={14} className="text-brand-red" /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                    <span className="badge bg-slate-100 text-slate-600">{a.category}</span>
                    <span>{fmtDate(a.createdAt)}</span><span>·</span>
                    <span>{typeof a.createdBy === 'object' ? a.createdBy.name : 'Admin'}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        }
      </div>

      <Modal open={compose} onClose={() => setCompose(false)} title="Compose Announcement" size="lg" footer={<>
        <button className="btn-secondary" onClick={() => setCompose(false)}>Cancel</button>
        <button className="btn-primary" disabled={busy} onClick={submit}>{busy ? 'Publishing…' : 'Publish Announcement'}</button>
      </>}>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Mid-Term Examination Schedule" /></div>
          <div><label className="label">Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}>{CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          <div><label className="label">Body</label><textarea className="input h-40 py-2" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Announcement content…" /></div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-2">Student Preview</p>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Megaphone size={12} /> {category}</div>
              <p className="text-sm font-semibold">{title || 'Announcement title'}</p>
              <p className="text-xs text-slate-600 mt-1 line-clamp-3">{body || 'Announcement body will appear here.'}</p>
            </div>
          </div>
        </form>
      </Modal>

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Announcement Preview" size="md" footer={<button className="btn-secondary" onClick={() => setPreview(null)}>Close</button>}>
        {preview && (
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2"><Megaphone size={14} /> {preview.category}</div>
            <h3 className="font-heading font-semibold text-lg">{preview.title}</h3>
            <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">{preview.body}</p>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Announcement" size="sm" footer={<>
        <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
        <button className="btn-danger" disabled={busy} onClick={doDelete}>{busy ? 'Deleting…' : 'Delete'}</button>
      </>}>
        <p className="text-sm text-slate-600">Are you sure you want to delete "{deleteTarget?.title}"? This cannot be undone.</p>
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