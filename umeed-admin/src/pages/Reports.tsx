import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { dashboardService } from '@/services/dashboardService'
import type { AdminStats } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'

const COLORS = ['#16A34A', '#0D9488', '#F59E0B', '#DC2626', '#6366F1', '#64748B']

export default function Reports() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { setStats(await dashboardService.stats()) }
    catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return <Spinner />
  if (error || !stats) return <ErrorState message={error || 'Unknown error'} onRetry={load} />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Campus Analytics & Institutional Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Institution-wide complaint and welfare metrics.</p>
        </div>
        <button className="btn-secondary" disabled title="Export is a planned feature">
          <Download size={16} /> Export Report
          <span className="text-[10px] text-slate-400 ml-1">(planned)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Cumulative Complaints" value={stats.totalComplaints} />
        <Kpi label="Mean Resolution" value={`${stats.avgResolutionHours} hrs`} />
              <Kpi label="Welfare Requests" value={stats.welfareTotal} />
        <Kpi label="Satisfaction Index" value="N/A" hint="Feedback not yet enabled" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Intake Volume vs Resolution Velocity">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="filed" name="Filed" stroke="#F59E0B" strokeWidth={2} />
              <Line dataKey="resolved" name="Resolved" stroke="#16A34A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Category Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.categoryBreakdown} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
                {stats.categoryBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Status Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.statusBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <Tooltip />
              <Bar dataKey="value" fill="#0D9488" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Monthly Trend">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="filed" name="Filed" fill="#16A34A" radius={[8, 8, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#0D9488" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-heading font-semibold">Complaint Summary</h2>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr><th className="th">Category</th><th className="th">Total</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.categoryBreakdown.map((c) => (
              <tr key={c.name}>
                <td className="td">{c.name}</td>
                <td className="td font-semibold">{c.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className="text-2xl font-heading font-semibold mt-1">{value}</p>
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="font-heading font-semibold text-slate-800 mb-3">{title}</h2>
      {children}
    </div>
  )
}