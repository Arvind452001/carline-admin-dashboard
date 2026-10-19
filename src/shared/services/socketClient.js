import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

let socketInstance = null
const listeners = new Map()

export function getSocketBaseUrl() {
  const envUrl = import.meta.env.VITE_SOCKET_URL
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '')
  }
  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1').trim()
  return apiBase.replace(/\/api\/v1\/?$/, '')
}

export function getSocketPath() {
  const envPath = import.meta.env.VITE_SOCKET_PATH
  if (envPath && envPath.trim()) {
    return envPath.trim()
  }
  const apiBase = (import.meta.env.VITE_API_BASE_URL || '').trim()
  if (apiBase.includes('node.aitechnotech.in')) {
    return '/viamo/socket.io'
  }
  return '/socket.io'
}

export const socketClient = {
  connect() {
    const token = useAuthStore.getState().token
    if (!token) {
      this.disconnect()
      return null
    }

    if (socketInstance && socketInstance.connected) {
      return socketInstance
    }

    if (socketInstance) {
      socketInstance.disconnect()
      socketInstance = null
    }

    const socketUrl = getSocketBaseUrl()
    const socketPath = getSocketPath()

    try {
      socketInstance = io(socketUrl, {
        path: socketPath,
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 2000,
        timeout: 10000,
      })

      socketInstance.on('connect', () => {
        // Re-attach registered listeners
        for (const [event, callbacks] of listeners.entries()) {
          for (const cb of callbacks) {
            socketInstance.off(event, cb)
            socketInstance.on(event, cb)
          }
        }
      })

      socketInstance.on('connect_error', (err) => {
        console.debug('[socketClient] Connection error:', err?.message)
      })

      return socketInstance
    } catch (err) {
      console.warn('[socketClient] Failed to initialize socket:', err)
      return null
    }
  },

  disconnect() {
    if (socketInstance) {
      socketInstance.disconnect()
      socketInstance = null
    }
  },

  on(event, callback) {
    if (!event || typeof callback !== 'function') return

    if (!listeners.has(event)) {
      listeners.set(event, new Set())
    }
    listeners.get(event).add(callback)

    if (socketInstance) {
      socketInstance.on(event, callback)
    }
  },

  off(event, callback) {
    if (!event) return

    if (callback && listeners.has(event)) {
      listeners.get(event).delete(callback)
    } else {
      listeners.delete(event)
    }

    if (socketInstance) {
      if (callback) {
        socketInstance.off(event, callback)
      } else {
        socketInstance.off(event)
      }
    }
  },

  emit(event, data) {
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit(event, data)
    }
  },

  getSocket() {
    return socketInstance
  },

  isConnected() {
    return Boolean(socketInstance && socketInstance.connected)
  },
}
