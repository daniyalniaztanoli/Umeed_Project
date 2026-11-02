import { useState, FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sprout } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { DEMO_MODE } from '@/services/api'

export default function Login() {
  const { login } = useAuth(); const nav = useNavigate(); const [params] = useSearchParams()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [show, setShow] = useState(false); const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false); const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email.trim(), password); nav('/dashboard', { replace: true }) }
    catch (err) { setError((err as Error).message || 'Unable to sign in') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-green text-white flex items-center justify-center shadow-card-hover"><Sprout size={32} /></div>
          <h1 className="mt-4 font-heading text-2xl font-semibold text-slate-900">Umeed</h1>
          <p className="text-sm text-slate-500 mt-1">Institutional Governance Portal</p>
        </div>
        <div className="card p-7">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck size={16} className="text-brand-green" />
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Administrator Sign-In</p>
          </div>
          {params.get('expired') && (<div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">Your session expired. Please sign in again.</div>)}
          {error && (<div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">{error}</div>)}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Institutional Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required autoComplete="email" className="input pl-9" placeholder="you@institution.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={show ? 'text' : 'password'} required autoComplete="current-password" className="input pl-9 pr-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShow((s) => !s)}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-slate-300 text-brand-green focus:ring-brand-green/30" />
              Trust this workstation for 30 days
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Authenticating…' : 'Authenticate & Enter Dashboard'}</button>
          </form>
          {DEMO_MODE && (
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <p className="font-semibold text-slate-700 mb-1">Demo credentials:</p>
              <p><code>admin@umeed.edu</code> / <code>admin123</code></p>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">Protected administrative system · Unauthorized access is prohibited</p>
      </div>
    </div>
  )
}