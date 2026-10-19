import { useEffect, useState } from 'react'
import { socketClient } from '@/shared/services/socketClient'
import { useAuthStore } from '@/store/authStore'

export function useSocket() {
  const token = useAuthStore((s) => s.token)
  const [connected, setConnected] = useState(socketClient.isConnected())

  useEffect(() => {
    if (!token) {
      setConnected(false)
      return
    }

    const socket = socketClient.connect()
    if (!socket) return

    function onConnect() {
      setConnected(true)
    }

    function onDisconnect() {
      setConnected(false)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    setConnected(socket.connected)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [token])

  return {
    connected,
    socket: socketClient.getSocket(),
    emit: socketClient.emit.bind(socketClient),
    on: socketClient.on.bind(socketClient),
    off: socketClient.off.bind(socketClient),
  }
}
