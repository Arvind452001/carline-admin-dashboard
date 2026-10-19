import { useNotificationStore } from '@/store/notificationStore'
import NotificationToast from './NotificationToast'

export default function NotificationToastContainer() {
  const activeToasts = useNotificationStore((s) => s.activeToasts)
  const dismissToast = useNotificationStore((s) => s.dismissToast)

  if (!activeToasts || activeToasts.length === 0) return null

  return (
    <aside
      aria-label="Notifications"
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-full px-2 sm:px-0"
    >
      {activeToasts.map((toast) => (
        <NotificationToast
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
        />
      ))}
    </aside>
  )
}
