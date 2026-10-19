import { useEffect } from 'react'
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  UserRound,
  CheckCheck,
  Check,
  ArrowRight,
  BellOff
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { ROLE_LABELS } from '@/access/roles'
import { initials } from '@/shared/utils/formatting'
import { getNotificationMeta, getNotificationTargetRoute } from '@/shared/utils/notificationUtils'
import Dropdown from '@/shared/components/Dropdown'
import Breadcrumbs from './Breadcrumbs'

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { user, role, logout } = useAuthStore()

  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount)
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  // Count unread: prefer unreadCount from API / socket, fallback to unread items in notifications
  const listUnread = notifications.filter((n) => !n.isRead && !n.read).length
  const unread = typeof unreadCount === 'number' && unreadCount > 0 ? unreadCount : listUnread

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNotificationClick(n) {
    if (!n.isRead && !n.read) {
      markAsRead(n.id || n._id)
    }
    const targetRoute = getNotificationTargetRoute(n, role)
    navigate(targetRoute)
  }

  function handleSingleMarkRead(e, n) {
    e.stopPropagation()
    if (!n.isRead && !n.read) {
      markAsRead(n.id || n._id)
    }
  }

  function handleBellClick() {
    fetchUnreadCount()
    fetchNotifications({ page: 1, limit: 10, silent: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border-subtle bg-ink/95 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-raised lg:hidden"
        >
          <Menu size={20} />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        {/* Bell Icon Notification Center Dropdown */}
        <Dropdown
          trigger={
            <button
              type="button"
              onClick={handleBellClick}
              aria-label="Notifications"
              className="relative inline-flex items-center justify-center rounded-xl p-2 text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors focus:outline-none"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 z-20 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold leading-none text-white shadow-md ring-2 ring-ink select-none animate-in zoom-in-50 duration-150">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </button>
          }
        >
          <div className="w-80 sm:w-96 overflow-hidden">
            {/* Dropdown Header */}
            <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2.5 bg-surface-raised/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary">Notifications</span>
                {unread > 0 && (
                  <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.2 text-[10px] font-bold text-rose-400">
                    {unread} unread
                  </span>
                )}
              </div>

              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-taxi-400 hover:text-taxi-300 transition-colors"
                >
                  <CheckCheck size={12} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notification items */}
            <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle/50">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                  <BellOff size={24} className="text-text-muted mb-2 opacity-60" />
                  <p className="text-xs font-medium text-text-secondary">No notifications yet</p>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Real-time alerts and trip events will appear here
                  </p>
                </div>
              ) : (
                notifications.slice(0, 6).map((n) => {
                  const meta = getNotificationMeta(n.type)
                  const Icon = meta.icon
                  const isRead = n.isRead || n.read

                  return (
                    <div
                      key={n.id || n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`group flex items-start gap-2.5 p-3 cursor-pointer transition-colors ${
                        isRead ? 'hover:bg-surface-hover/70' : 'bg-taxi-500/5 hover:bg-taxi-500/10'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${meta.bg} ${meta.border}`}
                      >
                        <Icon size={14} className={meta.text} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs truncate ${
                              isRead ? 'text-text-primary font-medium' : 'text-text-primary font-bold'
                            }`}
                          >
                            {n.title}
                          </p>
                          <span className="text-[10px] text-text-muted shrink-0">{n.time}</span>
                        </div>

                        {n.body && (
                          <p className="mt-0.5 text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                            {n.body}
                          </p>
                        )}
                      </div>

                      {!isRead ? (
                        <button
                          type="button"
                          onClick={(e) => handleSingleMarkRead(e, n)}
                          className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-taxi-500/15 hover:bg-taxi-500/30 text-taxi-400 transition-colors"
                          title="Mark as read"
                        >
                          <Check size={11} />
                        </button>
                      ) : null}
                    </div>
                  )
                })
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="border-t border-border-subtle p-2 bg-surface-raised/40">
              <button
                type="button"
                onClick={() => navigate(`/${role}/notifications`)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-taxi-400 hover:bg-surface-raised hover:text-taxi-300 transition-colors"
              >
                <span>View all in Notification Center</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </Dropdown>

        {/* User Profile Menu */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-surface-raised transition-colors">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-taxi-500/15 text-xs font-semibold text-taxi-400">
                {initials(user?.name) || 'U'}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-medium leading-none text-text-primary">
                  {user?.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-text-muted">
                  {ROLE_LABELS[role]}
                </span>
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
