import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen grid place-items-center"><Spinner /></div>
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />
  return <Outlet />
}