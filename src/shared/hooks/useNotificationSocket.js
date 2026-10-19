import { useEffect } from 'react'
import { socketClient } from '@/shared/services/socketClient'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'

/**
 * Hook to manage Socket.IO connection and listen for:
 * - 'notification:new': popup toast + sound alert + prepend notification
 * - 'notification:count': update bell badge count in real-time
 */
export function useNotificationSocket() {
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setSocketConnected = useNotificationStore((s) => s.setSocketConnected)
  const handleIncomingNotification = useNotificationStore((s) => s.handleIncomingNotification)
  const handleCountUpdate = useNotificationStore((s) => s.handleCountUpdate)
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount)

  useEffect(() => {
    if (!token || !isAuthenticated) {
      setSocketConnected(false)
      socketClient.disconnect()
      return
    }

    const socket = socketClient.connect()
    if (!socket) return

    function onConnect() {
      setSocketConnected(true)
      // On connection/reconnection, ensure fresh unread count
      fetchUnreadCount()
    }

    function onDisconnect() {
      setSocketConnected(false)
    }

    // 1. notification:new — Jaise hi naya alert aaye, popup dikhane ke liye
    function onNewNotification(payload) {
      handleIncomingNotification(payload)
      // Re-sync count as backup
      fetchUnreadCount()
    }

    // 2. notification:count — Bell badge ka number real-time update karne ke liye
    function onCountUpdate(payload) {
      handleCountUpdate(payload)
    }

    // Attach listeners
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('notification:new', onNewNotification)
    socket.on('notification:count', onCountUpdate)

    // Initial check
    if (socket.connected) {
      setSocketConnected(true)
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('notification:new', onNewNotification)
      socket.off('notification:count', onCountUpdate)
    }
  }, [token, isAuthenticated, setSocketConnected, handleIncomingNotification, handleCountUpdate, fetchUnreadCount])
}
