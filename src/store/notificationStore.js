import { create } from 'zustand'
import { notificationService } from '@/shared/services/notificationService'
import { normalizeNotification } from '@/shared/utils/notificationUtils'
import { playNotificationChime } from '@/shared/services/notificationAudio'
import { initFirebaseMessaging } from '@/shared/services/firebaseMessaging'

function parseUnreadCount(res) {
  if (typeof res === 'number') return res
  if (typeof res === 'string' && /^\d+$/.test(res.trim())) return parseInt(res.trim(), 10)
  if (!res || typeof res !== 'object') return 0
  const raw = res.count ?? res.unreadCount ?? res.data?.count ?? res.data?.unreadCount ?? 0
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  limit: 20,
  loading: false,
  refreshing: false,
  error: null,
  filterType: 'ALL',
  searchQuery: '',
  activeToasts: [],
  isSocketConnected: false,
  fcmInitialized: false,

  /**
   * Fetch unread notification count for the bell badge (GET /api/v1/notification/unread-count)
   */
  fetchUnreadCount: async () => {
    try {
      const res = await notificationService.getUnreadCount()
      const count = parseUnreadCount(res)
      set({ unreadCount: count })
      return count
    } catch (err) {
      console.debug('[notificationStore] fetchUnreadCount failed:', err?.message)
      return get().unreadCount
    }
  },

  /**
   * Update unread count from real-time Socket.IO event 'notification:count'
   * @param {number|object} payload e.g. { count: 3 } or 3
   */
  handleCountUpdate: (payload) => {
    const count = parseUnreadCount(payload)
    set({ unreadCount: count })
  },

  /**
   * Fetch paginated notification history (GET /api/v1/notification/my?page=1&limit=20)
   */
  fetchNotifications: async ({ page = 1, limit = 20, silent = false } = {}) => {
    if (!silent) {
      set({ loading: true, error: null })
    } else {
      set({ refreshing: true })
    }

    try {
      const res = await notificationService.getMyNotifications({ page, limit })
      const rawList = Array.isArray(res?.notifications)
        ? res.notifications
        : Array.isArray(res)
        ? res
        : []

      const normalized = rawList.map(normalizeNotification).filter(Boolean)
      const total = Number(res?.total ?? normalized.length)
      const unreadFromList = normalized.filter((n) => !n.isRead && !n.read).length
      const countFromApi = parseUnreadCount(res)
      const finalCount = countFromApi > 0 ? countFromApi : unreadFromList

      set({
        notifications: normalized,
        total,
        page: Number(res?.page ?? page),
        limit: Number(res?.limit ?? limit),
        unreadCount: finalCount,
        loading: false,
        refreshing: false,
        error: null,
      })

      return normalized
    } catch (err) {
      console.warn('[notificationStore] fetchNotifications error:', err?.message)
      set({
        loading: false,
        refreshing: false,
        error: err?.message || 'Failed to load notifications',
      })
      return []
    }
  },

  /**
   * Mark a single notification as read (PATCH /api/v1/notification/:id/read)
   * Decreases the unread badge counter by 1.
   */
  markAsRead: async (id) => {
    if (!id) return
    const target = get().notifications.find((n) => n.id === id || n._id === id)
    const wasUnread = target ? !target.isRead && !target.read : true

    const currentUnread =
      get().unreadCount > 0
        ? get().unreadCount
        : get().notifications.filter((n) => !n.isRead && !n.read).length
    const nextCount = wasUnread ? Math.max(0, currentUnread - 1) : currentUnread

    // Optimistic UI update: mark notification read and decrease unreadCount
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id || n._id === id
          ? { ...n, isRead: true, read: true, readAt: new Date().toISOString() }
          : n
      ),
      unreadCount: nextCount,
    }))

    try {
      await notificationService.markAsRead(id)
    } catch (err) {
      console.warn('[notificationStore] markAsRead failed:', err?.message)
    }
  },

  /**
   * Mark all notifications as read (PATCH /api/v1/notification/read-all)
   * Resets unread counter to 0.
   */
  markAllAsRead: async () => {
    // Optimistic UI update: set all notifications to read and counter to 0
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        read: true,
        readAt: new Date().toISOString(),
      })),
      unreadCount: 0,
    }))

    try {
      await notificationService.markAllAsRead()
    } catch (err) {
      console.warn('[notificationStore] markAllAsRead failed:', err?.message)
    }
  },

  // Backwards compatibility alias
  markAllRead: async () => {
    return get().markAllAsRead()
  },

  /**
   * Send test push notification (POST /api/v1/notification/test-push)
   */
  sendTestNotification: async (payload) => {
    const res = await notificationService.sendTestPush(payload)
    // Refetch notifications to reflect test notification in list
    await get().fetchNotifications({ page: 1, limit: get().limit, silent: true })
    return res
  },

  /**
   * Handle incoming real-time notification (from Socket.IO 'notification:new' or FCM)
   */
  handleIncomingNotification: (raw) => {
    const normalized = normalizeNotification(raw)
    if (!normalized) return

    // Sound alert
    playNotificationChime()

    // Update list & increment badge count
    set((state) => {
      const existingIdx = state.notifications.findIndex(
        (n) =>
          n.id === normalized.id ||
          (normalized.data?.rideId &&
            n.data?.rideId === normalized.data.rideId &&
            n.type === normalized.type)
      )

      let updatedList = [...state.notifications]
      if (existingIdx !== -1) {
        updatedList[existingIdx] = normalized
      } else {
        updatedList = [normalized, ...state.notifications]
      }

      // Add to active toast queue (max 4 concurrent)
      const toastItem = {
        ...normalized,
        toastId: `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      }
      const updatedToasts = [toastItem, ...state.activeToasts].slice(0, 4)

      return {
        notifications: updatedList,
        unreadCount: state.unreadCount + 1,
        total: state.total + 1,
        activeToasts: updatedToasts,
      }
    })
  },

  /**
   * Dismiss foreground toast notification
   */
  dismissToast: (id) => {
    set((state) => ({
      activeToasts: state.activeToasts.filter((t) => t.id !== id && t.toastId !== id),
    }))
  },

  setFilterType: (filterType) => set({ filterType }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSocketConnected: (isSocketConnected) => set({ isSocketConnected }),

  /**
   * Initialize Web Push notifications via Firebase Cloud Messaging
   */
  initFcm: async () => {
    if (get().fcmInitialized) return
    set({ fcmInitialized: true })
    await initFirebaseMessaging((msg) => {
      get().handleIncomingNotification(msg)
    })
  },
}))
