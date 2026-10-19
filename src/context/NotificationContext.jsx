import { createContext, useContext } from 'react'
import { useNotificationStore } from '@/store/notificationStore'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const notifications = useNotificationStore()
  return <NotificationContext.Provider value={notifications}>{children}</NotificationContext.Provider>
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider')
  return ctx
}
