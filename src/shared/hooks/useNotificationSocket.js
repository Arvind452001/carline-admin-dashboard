import { useEffect } from 'react'
import { socketClient } from '@/shared/services/socketClient'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '@/store/authStore'

export function useNotificationSocket() {
  const { token, isAuthenticated } = useAuthStore()
  const { handleNewNotification, handleCountUpdate } = useNotificationStore()

  useEffect(() => {
    if (!isAuthenticated || !token) return

    const socket = socketClient.connect()

    // 1. Listen for new real-time alerts
    const onNewNotification = (data) => {
      console.log('[socket] notification:new received:', data)
      handleNewNotification(data)
    }

    // 2. Listen for count updates
    const onCountUpdate = (data) => {
      console.log('[socket] notification:count received:', data)
      handleCountUpdate(data)
    }

    socket.on('notification:new', onNewNotification)
    socket.on('notification:count', onCountUpdate)

    return () => {
      socket.off('notification:new', onNewNotification)
      socket.off('notification:count', onCountUpdate)
    }
  }, [isAuthenticated, token, handleNewNotification, handleCountUpdate])
}
