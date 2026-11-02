import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/hooks/useToast'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import ComplaintQueue from '@/pages/ComplaintQueue'
import ComplaintDetails from '@/pages/ComplaintDetails'
import WelfareRequests from '@/pages/WelfareRequests'
import Announcements from '@/pages/Announcements'
import StaffDirectory from '@/pages/StaffDirectory'
import UserDirectory from '@/pages/UserDirectory'
import Reports from '@/pages/Reports'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/complaints" element={<ComplaintQueue />} />
                <Route path="/complaints/:id" element={<ComplaintDetails />} />
                <Route path="/welfare" element={<WelfareRequests />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/staff" element={<StaffDirectory />} />
                <Route path="/users" element={<UserDirectory />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}