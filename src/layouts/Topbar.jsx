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
  const { notifications, serverUnreadCount, markRead, markAllRead } = useNotificationStore()
  const unread = serverUnreadCount !== null && serverUnreadCount !== undefined
    ? serverUnreadCount
    : notifications.filter((n) => !n.read).length

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNotificationClick(n) {
    markRead(n.id)
    if (n.link) {
      navigate(n.link)
    } else {
      navigate(`/${role}/notifications`)
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border-subtle bg-surface/90 px-4 backdrop-blur-md lg:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-xl p-2 text-text-secondary hover:bg-slate-100 lg:hidden cursor-pointer">
          <Menu size={20} />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-3">
        <Dropdown
          trigger={
            <button className="relative rounded-xl p-2.5 text-text-secondary hover:bg-slate-100 hover:text-text-primary transition-colors cursor-pointer border border-border-subtle bg-surface shadow-2xs">
              <Bell size={17} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-taxi-500 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unread}
                </span>
              )}
            </button>
          }
        >
          <div className="w-80 sm:w-88 flex flex-col">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border-subtle bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-primary">Notifications</span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-taxi-500/10 text-taxi-600 text-[10px] font-bold border border-taxi-500/20">
                    {unread} new
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    markAllRead()
                  }}
                  className="text-[11px] font-semibold text-taxi-600 hover:text-taxi-700 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle/50">
              {notifications.slice(0, 6).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex items-start gap-3 px-3.5 py-2.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                    !n.read ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <span
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      !n.read ? 'bg-taxi-500 ring-2 ring-taxi-500/20' : 'bg-transparent'
                    }`}
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className={`text-xs leading-snug line-clamp-1 ${!n.read ? 'font-bold text-text-primary' : 'font-medium text-text-secondary'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-text-muted line-clamp-1">
                      {n.message || n.title}
                    </p>
                    <span className="text-[10px] text-text-muted block pt-0.5">
                      {n.time}
                    </span>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="py-8 text-center text-xs text-text-muted">
                  No notifications yet.
                </div>
              )}
            </div>

            <div className="p-2 border-t border-border-subtle bg-slate-50/50 text-center">
              <button
                type="button"
                onClick={() => navigate(`/${role}/notifications`)}
                className="w-full text-center text-xs font-bold text-taxi-600 hover:text-taxi-700 py-1 hover:underline cursor-pointer"
              >
                View all notifications →
              </button>
            </div>
          </div>
        </Dropdown>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2.5 rounded-xl py-1.5 pl-2 pr-3 bg-surface hover:bg-slate-50 border border-border-subtle transition-all cursor-pointer shadow-xs">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-taxi-500/15 text-xs font-bold text-taxi-600">
                {initials(user?.name) || 'U'}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold leading-none text-text-primary">{user?.name}</span>
                <span className="mt-0.5 block text-[10px] font-semibold text-text-muted uppercase tracking-wider">{ROLE_LABELS[role]}</span>
              </span>
              <ChevronDown size={14} className="hidden text-text-muted sm:block" />
            </button>
          }
        >
          <button
            onClick={() => navigate(`/${role}/profile`)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-text-secondary hover:bg-surface-hover cursor-pointer"
          >
            <UserRound size={14} /> Profile
          </button>
          <button 
            onClick={() => navigate(`/${role}/profile`)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-text-secondary hover:bg-surface-hover cursor-pointer"
          >
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
