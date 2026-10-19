import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useNotificationSocket } from '@/shared/hooks/useNotificationSocket'
import NotificationToast from '@/shared/components/NotificationToast/NotificationToast'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Real-time notification socket listener
  useNotificationSocket()

  return (
    <div className="flex min-h-screen bg-ink">
      <NotificationToast />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
