import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { DEMO_MODE } from '@/services/api'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-brand-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        {DEMO_MODE && (
          <div className="bg-amber-50 text-amber-800 text-xs font-medium px-4 py-2 border-b border-amber-200">
            Demo Mode — displaying mock data. Set <code className="mx-1">VITE_DEMO_MODE=false</code> in <code>.env</code> to connect to the live backend.
          </div>
        )}
        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  )
}