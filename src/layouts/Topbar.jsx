import { Menu, Bell, ChevronDown, LogOut, Settings, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { ROLE_LABELS } from '@/access/roles'
import { initials } from '@/shared/utils/formatting'
import Dropdown from '@/shared/components/Dropdown'
import Breadcrumbs from './Breadcrumbs'

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { user, role, logout } = useAuthStore()
  const notifications = useNotificationStore((s) => s.notifications)
  const unread = notifications.filter((n) => !n.read).length

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border-subtle bg-ink/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-raised lg:hidden">
          <Menu size={20} />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <Dropdown
          trigger={
            <button className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-raised hover:text-text-primary">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-taxi-500 ring-2 ring-ink" />
              )}
            </button>
          }
        >
          <div className="max-h-72 w-64 overflow-y-auto">
            <p className="px-2 py-1.5 text-xs font-medium text-text-muted">Notifications</p>
            {notifications.map((n) => (
              <div key={n.id} className="rounded-md px-2 py-2 hover:bg-surface-hover">
                <p className="text-xs text-text-primary">{n.title}</p>
                <p className="mt-0.5 text-[11px] text-text-muted">{n.time}</p>
              </div>
            ))}
          </div>
        </Dropdown>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-surface-raised">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-taxi-500/15 text-xs font-semibold text-taxi-400">
                {initials(user?.name) || 'U'}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-medium leading-none text-text-primary">{user?.name}</span>
                <span className="mt-0.5 block text-[11px] text-text-muted">{ROLE_LABELS[role]}</span>
              </span>
              <ChevronDown size={14} className="hidden text-text-muted sm:block" />
            </button>
          }
        >
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-text-secondary hover:bg-surface-hover">
            <UserRound size={14} /> Profile
          </button>
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-text-secondary hover:bg-surface-hover">
            <Settings size={14} /> Settings
          </button>
          <div className="my-1 h-px bg-border-subtle" />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-signal-red hover:bg-signal-red/10"
          >
            <LogOut size={14} /> Log out
          </button>
        </Dropdown>
      </div>
    </header>
  )
}
