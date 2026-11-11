import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Clock, FileStack, HeartHandshake, Users, Plus, ArrowRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts'
import { dashboardService } from '@/services/dashboardService'
import { complaintService } from '@/services/complaintService'
import type { AdminStats, Complaint } from '@/types'
import { StatCard } from '@/components/ui/Card'
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAuth } from '@/context/AuthContext'
import { timeAgo } from '@/utils/format'

const CAT_COLORS = ['#16A34A', '#0D9488', '#F59E0B', '#DC2626', '#6366F1', '#64748B']

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [urgent, setUrgent] = useState<Complaint[]>([])
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [s, c] = await Promise.all([dashboardService.stats(), complaintService.list({ priority: 'High', limit: 5 })])
      setStats(s); setUrgent(c.data)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  if (loading) return <Spinner />
  if (error || !stats) return <ErrorState message={error || 'Unknown error'} onRetry={load} />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">Welcome back, {user?.name?.split(' ')[0] || 'Administrator'}</h1>
          <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Fall 2024</p>
        </div>
        <div className="flex gap-2">
          <Link to="/complaints?priority=High" className="btn-secondary"><AlertTriangle size={16}/> Urgent Complaints</Link>
          <Link to="/announcements" className="btn-primary"><Plus size={16}/> New Announcement</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <StatCard label="Total Filed" value={stats.totalComplaints} icon={FileStack} tone="slate" />
        <StatCard label="Pending Triage" value={stats.pending} icon={Clock} tone="amber" />
        <StatCard label="In Progress" value={stats.inProgress} icon={AlertTriangle} tone="teal" />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="green" />
        <StatCard label="Welfare Claims" value={stats.welfareTotal} icon={HeartHandshake} tone="teal" />
        <StatCard label="Active Students" value={stats.activeStudents} icon={Users} tone="slate" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-slate-800">Six-Month Resolution & Intake</h2>
          <p className="text-xs text-slate-500 mt-1">Filed vs. resolved complaints</p>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <LineChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="filed" stroke="#F59E0B" strokeWidth={2} name="Filed" />
                <Line type="monotone" dataKey="resolved" stroke="#16A34A" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-slate-800">Complaint Category Distribution</h2>
          <p className="text-xs text-slate-500 mt-1">Breakdown by category</p>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={stats.categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
                  {stats.categoryBreakdown.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <h2 className="font-heading font-semibold text-slate-800">Complaint Status Distribution</h2>
          <div className="h-56 mt-3">
            <ResponsiveContainer>
              <BarChart data={stats.statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip /><Bar dataKey="value" fill="#0D9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-slate-800">High-Priority Queue</h2>
            <Link to="/complaints?priority=High" className="text-xs text-brand-teal font-semibold hover:underline">View all</Link>
          </div>
          <div className="mt-3 space-y-2">
            {urgent.length === 0 && <p className="text-sm text-slate-500 py-6 text-center">No high-priority complaints.</p>}
            {urgent.map((c) => (
              <Link key={c._id} to={`/complaints/${c._id}`} className="block p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">{c._id}</span>
                  <PriorityBadge priority={c.priority} />
                </div>
                <p className="text-sm font-medium text-slate-800 mt-1">{c.title}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-slate-500">{typeof c.reportedBy === 'object' ? c.reportedBy.name : '—'}</span>
                  <span className="text-[10px] text-slate-400">{timeAgo(c.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-slate-800">Recent Complaints</h2>
          <Link to="/complaints" className="text-xs text-brand-teal font-semibold hover:underline flex items-center gap-1">Open Queue <ArrowRight size={12} /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="th">ID</th><th className="th">Title</th><th className="th">Category</th>
                <th className="th">Priority</th><th className="th">Status</th><th className="th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {urgent.slice(0, 5).map((c) => (
                <tr key={c._id}>
                  <td className="td font-mono text-xs">{c._id}</td>
                  <td className="td font-medium">{c.title}</td>
                  <td className="td">{c.category}</td>
                  <td className="td"><PriorityBadge priority={c.priority} /></td>
                  <td className="td"><StatusBadge status={c.status} /></td>
                  <td className="td"><Link className="text-brand-teal text-xs font-semibold" to={`/complaints/${c._id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}