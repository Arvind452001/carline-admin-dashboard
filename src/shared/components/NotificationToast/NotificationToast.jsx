import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, AlertTriangle, Car, User, ExternalLink, X, Radio } from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import Button from '@/shared/components/Button'

export default function NotificationToast() {
  const navigate = useNavigate()
  const { role } = useAuthStore()
  const { activeToast, dismissToast, markRead } = useNotificationStore()
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!activeToast) {
      setProgress(100)
      return
    }

    setProgress(100)
    const DURATION = 8000 // 8s auto-close
    const INTERVAL = 80
    const decrement = (INTERVAL / DURATION) * 100

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= decrement) {
            clearInterval(timer)
            dismissToast()
            return 0
          }
          return prev - decrement
        })
      }
    }, INTERVAL)

    return () => clearInterval(timer)
  }, [activeToast, isPaused, dismissToast])

  if (!activeToast) return null

  const getIcon = () => {
    switch (activeToast.category) {
      case 'trip':
        return <Car size={18} className="text-blue-500" />
      case 'driver':
        return <User size={18} className="text-emerald-500" />
      case 'alert':
        return <AlertTriangle size={18} className="text-rose-500" />
      default:
        return <Bell size={18} className="text-taxi-500" />
    }
  }

  const handleAction = () => {
    markRead(activeToast.id)
    dismissToast()
    if (activeToast.link) {
      navigate(activeToast.link)
    } else {
      navigate(`/${role || 'dispatcher'}/notifications`)
    }
  }

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed top-5 right-5 z-[100] max-w-sm sm:max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto"
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface/95 backdrop-blur-xl border-2 border-taxi-500/30 shadow-2xl shadow-taxi-500/10 p-4 transition-all">
        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-taxi-500 transition-all duration-75 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-start gap-3.5">
          {/* Pulsing Icon */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-xl bg-surface-raised border border-border-subtle flex items-center justify-center shadow-xs">
              {getIcon()}
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-taxi-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-taxi-500" />
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-taxi-500/10 text-taxi-600 border border-taxi-500/20">
                New Alert
              </span>
              {activeToast.type && (
                <span className="text-[10px] font-semibold text-text-muted">
                  • {activeToast.type.replace(/_/g, ' ')}
                </span>
              )}
              <span className="text-[10px] text-text-muted ml-auto">Just now</span>
            </div>

            <h4 className="text-sm font-bold text-text-primary leading-snug line-clamp-1">
              {activeToast.title}
            </h4>

            {activeToast.message && (
              <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                {activeToast.message}
              </p>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border-subtle/50">
              <Button
                size="xs"
                variant="primary"
                icon={ExternalLink}
                onClick={handleAction}
              >
                View Details
              </Button>
              <button
                type="button"
                onClick={dismissToast}
                className="text-xs font-semibold text-text-muted hover:text-text-primary px-2.5 py-1 rounded-lg hover:bg-surface-raised transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={dismissToast}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-raised transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
