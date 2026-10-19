import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { NotificationToastContainer } from '@/shared/components/Toast'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-ink">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>

      {/* Real-time in-app foreground toast alerts */}
      <NotificationToastContainer />
    </div>
  )
}
