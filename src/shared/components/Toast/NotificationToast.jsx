import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ArrowRight, KeyRound } from 'lucide-react'
import { getNotificationMeta, getNotificationTargetRoute } from '@/shared/utils/notificationUtils'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'

export default function NotificationToast({ toast, onDismiss }) {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role) || 'dispatcher'
  const [progress, setProgress] = useState(100)

  const meta = getNotificationMeta(toast.type)
  const Icon = meta.icon
  const otp = toast.data?.otp
  const rideId = toast.data?.rideId

  useEffect(() => {
    const duration = 6000
    const interval = 50
    const step = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer)
          onDismiss(toast.id)
          return 0
        }
        return prev - step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [toast.id, onDismiss])

  function handleAction() {
    onDismiss(toast.id)
    if (toast.id) {
      useNotificationStore.getState().markAsRead(toast.id)
    }
    const targetRoute = getNotificationTargetRoute(toast, role)
    navigate(targetRoute)
  }

  return (
    <div className="group pointer-events-auto relative w-80 sm:w-96 overflow-hidden rounded-2xl border border-border-strong bg-ink/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-taxi-500/10 animate-in slide-in-from-top-4 fade-in">
      {/* Top progress bar */}
      <div className="absolute left-0 top-0 h-0.5 w-full bg-surface-raised">
        <div
          className="h-full bg-taxi-500 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-3">
        {/* Dynamic Event Icon */}
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.border} border`}>
          <Icon size={18} className={meta.text} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.badge}`}>
              {meta.label}
            </span>
            <span className="text-[11px] text-text-muted">Just now</span>
          </div>

          <h4 className="mt-1 text-xs font-semibold text-text-primary leading-snug">
            {toast.title}
          </h4>

          {toast.body && (
            <p className="mt-0.5 text-[11px] text-text-secondary leading-relaxed line-clamp-2">
              {toast.body}
            </p>
          )}

          {/* Metadata pills (OTP, Ride ID) */}
          {(otp || rideId) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {otp && (
                <span className="inline-flex items-center gap-1 rounded-md bg-taxi-500/15 border border-taxi-500/30 px-1.5 py-0.5 text-[10px] font-bold text-taxi-400">
                  <KeyRound size={10} /> OTP: {otp}
                </span>
              )}
              {rideId && (
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-raised px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
                  ID: #{String(rideId).slice(-6)}
                </span>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border-subtle/50">
            <button
              onClick={handleAction}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-taxi-400 hover:text-taxi-300 transition-colors"
            >
              {rideId ? 'View Trip' : 'Open Details'}
              <ArrowRight size={12} />
            </button>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[11px] text-text-muted hover:text-text-primary transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="-mr-1 -mt-1 rounded-lg p-1 text-text-muted hover:bg-surface-raised hover:text-text-primary transition-colors"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
