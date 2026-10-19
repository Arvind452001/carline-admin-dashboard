import { createContext, useEffect } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationSocket } from '@/shared/hooks/useNotificationSocket'

export const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const store = useNotificationStore()
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Attach real-time Socket.IO listener for 'notification:new'
  useNotificationSocket()

  // Initial data loading when user is authenticated
  useEffect(() => {
    if (!token || !isAuthenticated) return

    // 1. Fetch unread count for bell icon badge
    store.fetchUnreadCount()

    // 2. Fetch notifications list
    store.fetchNotifications({ page: 1, limit: 20, silent: true })

    // 3. Initialize Web Push via Firebase Cloud Messaging if configured
    store.initFcm()

    // 4. Polling fallback every 45s to keep unread count synchronized
    const interval = setInterval(() => {
      store.fetchUnreadCount()
    }, 45000)

    return () => clearInterval(interval)
  }, [token, isAuthenticated])

  return (
    <NotificationContext.Provider value={store}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationProvider
