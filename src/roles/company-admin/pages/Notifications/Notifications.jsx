import { useEffect } from 'react'
import PageLayout from '@/layouts/PageLayout'
import { useNotificationStore } from '@/store/notificationStore'
import Button from '@/shared/components/Button'
import { CheckCheck, BellOff, RefreshCw } from 'lucide-react'
import { getNotificationMeta } from '@/shared/utils/notificationUtils'

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore()

  useEffect(() => {
    fetchNotifications({ page: 1, limit: 20 })
  }, [fetchNotifications])

  return (
    <PageLayout
      title="Notifications"
      description="Alerts, fleet updates, and events for your company."
      actions={
        <div className="flex items-center gap-2">
          <Button
            icon={CheckCheck}
            variant="secondary"
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
          >
            Mark all read
          </Button>
          <Button
            icon={RefreshCw}
            variant="secondary"
            disabled={loading || refreshing}
            onClick={() => fetchNotifications({ page: 1, limit: 20 })}
          >
            {loading || refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      }
    >
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/30 p-12 text-center">
          <BellOff size={28} className="text-text-muted mb-2 opacity-60" />
          <h3 className="text-sm font-semibold text-text-primary">No notifications yet</h3>
          <p className="mt-1 text-xs text-text-muted">Company and fleet alerts will appear here in real time.</p>
        </div>
      ) : (
        <div className="divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-surface overflow-hidden">
          {notifications.map((n) => {
            const meta = getNotificationMeta(n.type)
            const Icon = meta.icon
            const isRead = n.isRead || n.read

            return (
              <div
                key={n.id || n._id}
                onClick={() => (!isRead ? markAsRead(n.id || n._id) : null)}
                className={`flex items-center gap-3.5 px-4 py-3.5 transition-colors cursor-pointer ${
                  isRead ? 'hover:bg-surface-hover/60' : 'bg-taxi-500/5 hover:bg-taxi-500/10'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${meta.bg} ${meta.border}`}
                >
                  <Icon size={16} className={meta.text} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${isRead ? 'text-text-primary' : 'text-text-primary font-bold'}`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-text-muted shrink-0">{n.time}</span>
                  </div>
                  {n.body && (
                    <p className="mt-0.5 text-xs text-text-secondary line-clamp-1">{n.body}</p>
                  )}
                </div>

                {!isRead && (
                  <span className="h-2 w-2 rounded-full bg-taxi-500 shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </PageLayout>
  )
}
