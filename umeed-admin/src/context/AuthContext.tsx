import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { User } from '@/types'

interface AuthCtx { user: User | null; loading: boolean; login: (e: string, p: string) => Promise<void>; logout: () => void }
const Ctx = createContext<AuthCtx | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('umeed_token')) { setLoading(false); return }
    authService.me().then((u) => setUser(u)).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const u = await authService.login(email, password)
    if (u.role !== 'admin') { authService.logout(); throw new Error('Access denied — admin privileges required') }
    setUser(u)
  }
  const logout = () => { authService.logout(); setUser(null) }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}