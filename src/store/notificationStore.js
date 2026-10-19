import { create } from 'zustand'
import { mockNotifications } from '@/shared/utils/mockData'
import { notificationApi, normalizeNotification } from '@/shared/services/notificationApi'
import { playNotificationSound } from '@/shared/utils/sound'

const STORAGE_KEY = 'carline.notifications'

function loadNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : mockNotifications
  } catch {
    return mockNotifications
  }
}

function saveNotifications(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

export const useNotificationStore = create((set, get) => ({
  notifications: loadNotifications(),
  serverUnreadCount: null,
  activeToast: null,
  loading: false,
  error: null,
  lastFetchedAt: null,

  // 1. Fetch from /api/v1/notification/my
  fetchNotifications: async () => {
    set({ loading: true, error: null })
    try {
      const res = await notificationApi.getMyNotifications()
      const items = res?.notifications || (Array.isArray(res) ? res : [])
      saveNotifications(items)
      set({
        notifications: items,
        serverUnreadCount: res?.unreadCount ?? items.filter((n) => !n.read).length,
        pagination: res?.pagination || null,
        loading: false,
        error: null,
        lastFetchedAt: Date.now(),
      })
      return items
    } catch (err) {
      console.warn('[notificationStore] Could not fetch remote notifications, keeping current store:', err?.message || err)
      set({ loading: false, error: err?.message || 'Failed to load notifications' })
      return get().notifications
    }
  },

  // 2. Real-time event: notification:new
  handleNewNotification: (incoming) => {
    if (!incoming) return
    const raw = incoming.notification || incoming.data || incoming
    const normalized = normalizeNotification(raw) || {
      id: raw._id || raw.id || `notif-${Date.now()}`,
      title: raw.title || 'New Alert',
      message: raw.body || raw.message || 'You received a new alert.',
      category: 'alert',
      priority: 'high',
      time: 'Just now',
      timestamp: new Date().toISOString(),
      read: false,
      isRead: false,
      raw,
    }

    // Play sound chime
    playNotificationSound()

    set((s) => {
      // Avoid duplicate if same ID already exists
      const exists = s.notifications.some((n) => n.id === normalized.id)
      const updated = exists
        ? s.notifications.map((n) => (n.id === normalized.id ? normalized : n))
        : [normalized, ...s.notifications]

      saveNotifications(updated)

      const currentCount = s.serverUnreadCount !== null
        ? s.serverUnreadCount
        : s.notifications.filter((n) => !n.read).length

      return {
        notifications: updated,
        serverUnreadCount: currentCount + 1,
        activeToast: normalized, // triggers popup alert
      }
    })
  },

  // 3. Real-time event: notification:count
  handleCountUpdate: (payload) => {
    let count = 0
    if (typeof payload === 'number') {
      count = payload
    } else if (payload && typeof payload === 'object') {
      if (typeof payload.count === 'number') count = payload.count
      else if (typeof payload.unreadCount === 'number') count = payload.unreadCount
      else if (typeof payload.total === 'number') count = payload.total
    }
    set({ serverUnreadCount: Math.max(0, count) })
  },

  // Toast controls
  showToast: (notif) => set({ activeToast: notif }),
  dismissToast: () => set({ activeToast: null }),

  markRead: (id) => {
    set((s) => {
      const updated = s.notifications.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
      saveNotifications(updated)
      const currentCount = s.serverUnreadCount !== null
        ? s.serverUnreadCount
        : s.notifications.filter((n) => !n.read).length
      return {
        notifications: updated,
        serverUnreadCount: Math.max(0, currentCount - 1),
      }
    })
    notificationApi.markAsRead(id).catch(() => {})
  },

  toggleRead: (id) =>
    set((s) => {
      const target = s.notifications.find((n) => n.id === id)
      const newReadState = !target?.read
      const updated = s.notifications.map((n) => (n.id === id ? { ...n, read: newReadState, isRead: newReadState } : n))
      saveNotifications(updated)

      const currentCount = s.serverUnreadCount !== null
        ? s.serverUnreadCount
        : s.notifications.filter((n) => !n.read).length

      const newCount = newReadState ? Math.max(0, currentCount - 1) : currentCount + 1

      if (newReadState) {
        notificationApi.markAsRead(id).catch(() => {})
      }
      return { notifications: updated, serverUnreadCount: newCount }
    }),

  markAllRead: () => {
    set((s) => {
      const updated = s.notifications.map((n) => ({ ...n, read: true, isRead: true }))
      saveNotifications(updated)
      return { notifications: updated, serverUnreadCount: 0 }
    })
    notificationApi.markAllAsRead().catch(() => {})
  },

  removeNotification: (id) =>
    set((s) => {
      const updated = s.notifications.filter((n) => n.id !== id)
      saveNotifications(updated)
      return { notifications: updated }
    }),

  clearAll: () =>
    set(() => {
      saveNotifications([])
      return { notifications: [], serverUnreadCount: 0 }
    }),

  addNotification: (notif) =>
    set((s) => {
      const newNotif = {
        id: Date.now(),
        time: 'Just now',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
        category: 'system',
        ...notif,
      }
      const updated = [newNotif, ...s.notifications]
      saveNotifications(updated)
      return { notifications: updated }
    }),
}))
