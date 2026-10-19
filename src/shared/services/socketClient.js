import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

let socket = null

export const socketClient = {
  getSocket() {
    return socket
  },

  connect() {
    const token = useAuthStore.getState().token
    const user = useAuthStore.getState().user
    const role = useAuthStore.getState().role

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
    const socketHost = baseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/carlinee\/?$/, '')

    if (socket && socket.connected) {
      return socket
    }

    if (socket) {
      socket.disconnect()
    }

    socket = io(socketHost, {
      path: '/viamo/socket.io',
      auth: { token },
      query: {
        token: token || '',
        userId: user?._id || user?.id || '',
        role: role || '',
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => {
      console.log('[socket] Connected to server, id:', socket.id)
      const u = useAuthStore.getState().user
      const companyId = u?.companyId || u?.company?._id || u?.company
      if (companyId) {
        socket.emit('joinCompanyRoom', { companyId })
      }
      if (u?._id || u?.id) {
        socket.emit('joinUserRoom', { userId: u._id || u.id })
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('[socket] Disconnected:', reason)
    })

    socket.on('connect_error', (err) => {
      console.warn('[socket] Connection error:', err.message)
    })

    return socket
  },

  disconnect() {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  },

  on(event, callback) {
    if (!socket) this.connect()
    socket?.on(event, callback)
    return () => socket?.off(event, callback)
  },

  off(event, callback) {
    socket?.off(event, callback)
  },

  emit(event, data) {
    if (!socket) this.connect()
    socket?.emit(event, data)
  },
}
