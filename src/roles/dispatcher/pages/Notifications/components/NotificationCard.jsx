import { useNavigate } from 'react-router-dom'
import {
  Check,
  KeyRound,
  ExternalLink,
  Clock,
  CheckCircle,
  Hash
} from 'lucide-react'
import {
  getNotificationMeta,
  formatRelativeTime,
  formatDateTime,
  getNotificationTargetRoute,
} from '@/shared/utils/notificationUtils'
import { useAuthStore } from '@/store/authStore'

export default function NotificationCard({ notification, onMarkRead }) {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role) || 'dispatcher'

  const meta = getNotificationMeta(notification.type)
  const Icon = meta.icon
  const isRead = notification.isRead || notification.read
  const otp = notification.data?.otp
  const rideId = notification.data?.rideId || notification.data?.tripId

  function handleCardClick() {
    if (!isRead && onMarkRead) {
      onMarkRead(notification.id || notification._id)
    }
    const targetRoute = getNotificationTargetRoute(notification, role)
    if (rideId) {
      navigate(targetRoute)
    }
  }

  function handleMarkReadClick(e) {
    e.stopPropagation()
    if (onMarkRead) {
      onMarkRead(notification.id || notification._id)
    }
  }

  function handleNavigateClick(e) {
    e.stopPropagation()
    if (!isRead && onMarkRead) {
      onMarkRead(notification.id || notification._id)
    }
    const targetRoute = getNotificationTargetRoute(notification, role)
    navigate(targetRoute)
  }

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
        isRead
          ? 'bg-surface/50 border-border-subtle hover:bg-surface hover:border-border-strong'
          : 'bg-surface border-taxi-500/30 hover:border-taxi-500 shadow-sm shadow-taxi-500/5'
      }`}
    >
      {/* Left indicator accent for unread */}
      {!isRead && (
        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-taxi-500" />
      )}

      {/* Main content */}
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Dynamic type icon badge */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${meta.bg} ${meta.border}`}
        >
          <Icon size={20} className={meta.text} />
        </div>

        {/* Text and metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badge}`}
            >
              {meta.label}
            </span>

            {!isRead && (
              <span className="inline-flex items-center gap-1 rounded-full bg-taxi-500/20 px-2 py-0.5 text-[10px] font-semibold text-taxi-400">
                <span className="h-1.5 w-1.5 rounded-full bg-taxi-500 animate-pulse" />
                New
              </span>
            )}

            <span
              className="inline-flex items-center gap-1 text-[11px] text-text-muted"
              title={formatDateTime(notification.createdAt)}
            >
              <Clock size={11} />
              {notification.time || formatRelativeTime(notification.createdAt)}
            </span>
          </div>

          <h4
            className={`mt-1 text-sm font-semibold transition-colors ${
              isRead ? 'text-text-primary' : 'text-text-primary font-bold'
            }`}
          >
            {notification.title}
          </h4>

          {notification.body && (
            <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
              {notification.body}
            </p>
          )}

          {/* Contextual Pills */}
          {(otp || rideId) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {otp && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-taxi-500/15 border border-taxi-500/30 px-2 py-0.5 text-xs font-bold text-taxi-400 shadow-sm">
                  <KeyRound size={12} />
                  <span>OTP:</span>
                  <span className="font-mono tracking-wider">{otp}</span>
                </span>
              )}

              {rideId && (
                <button
                  type="button"
                  onClick={handleNavigateClick}
                  className="inline-flex items-center gap-1 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border-subtle px-2 py-0.5 text-xs font-mono text-text-muted hover:text-text-primary transition-colors"
                >
                  <Hash size={11} />
                  <span>Ride:</span>
                  <span>{String(rideId).slice(-8)}</span>
                  <ExternalLink size={10} className="ml-0.5 opacity-70" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center justify-end gap-2 shrink-0 sm:self-center border-t border-border-subtle sm:border-0 pt-2 sm:pt-0">
        {rideId && (
          <button
            type="button"
            onClick={handleNavigateClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-surface-raised hover:bg-surface-hover border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <span>View Trip</span>
            <ExternalLink size={12} />
          </button>
        )}

        {!isRead ? (
          <button
            type="button"
            onClick={handleMarkReadClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-taxi-500/15 hover:bg-taxi-500/25 border border-taxi-500/30 px-3 py-1.5 text-xs font-semibold text-taxi-400 transition-colors"
            title="Mark as read"
          >
            <Check size={13} />
            <span>Mark read</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-text-muted px-2 py-1 select-none">
            <CheckCircle size={12} className="text-emerald-500" />
            <span>Read</span>
          </span>
        )}
      </div>
    </div>
  )
}
