import { apiClient } from '@/shared/services/apiClient'

export function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Just now'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return 'Recently'
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function detectCategory(raw) {
  const cat = String(raw.category || raw.type || raw.eventType || '').toUpperCase()
  if (cat.includes('TRIP') || cat.includes('RIDE') || cat.includes('BOOKING')) return 'trip'
  if (cat.includes('DRIVER')) return 'driver'
  if (cat.includes('ALERT') || cat.includes('CANCEL') || cat.includes('SOS') || cat.includes('EMERGENCY')) return 'alert'
  if (cat.includes('PAY') || cat.includes('WALLET') || cat.includes('INVOICE') || cat.includes('FARE')) return 'payment'

  const text = `${raw.title || ''} ${raw.body || raw.message || ''}`.toLowerCase()
  if (text.includes('trip') || text.includes('booking') || text.includes('ride') || text.includes('passenger')) return 'trip'
  if (text.includes('driver')) return 'driver'
  if (text.includes('cancel') || text.includes('failed') || text.includes('alert') || text.includes('urgent')) return 'alert'
  if (text.includes('pay') || text.includes('wallet') || text.includes('dollar') || text.includes('$')) return 'payment'
  return 'system'
}

function detectPriority(raw) {
  if (raw.priority) return String(raw.priority).toLowerCase()
  const cat = String(raw.type || raw.category || '').toUpperCase()
  if (cat === 'DISPATCHER_ALERT' || cat.includes('URGENT') || cat.includes('CRITICAL')) return 'urgent'
  if (cat.includes('ALERT') || cat.includes('CANCEL') || raw.isUrgent) return 'high'
  const text = `${raw.title || ''} ${raw.body || raw.message || ''}`.toLowerCase()
  if (text.includes('urgent') || text.includes('emergency') || text.includes('critical')) return 'urgent'
  if (text.includes('cancel') || text.includes('attention') || text.includes('delayed')) return 'high'
  return 'normal'
}

function detectRefId(raw) {
  if (raw.refId) return raw.refId
  if (raw.tripId) return raw.tripId
  if (raw.bookingId) return raw.bookingId
  if (raw.driverId) return raw.driverId
  if (raw.trip?._id || raw.trip?.id) {
    const id = raw.trip._id || raw.trip.id
    return `TRP-${String(id).slice(-4).toUpperCase()}`
  }
  const text = `${raw.title || ''} ${raw.body || raw.message || ''}`
  const match = text.match(/(TRP-[A-Z0-9]+|DRV-[A-Z0-9]+|CMP-[A-Z0-9]+)/i)
  if (match) return match[1].toUpperCase()
  return null
}

function detectLink(raw, category) {
  if (raw.link) return raw.link
  if (raw.url) return raw.url
  if (raw.actionUrl) return raw.actionUrl
  if (category === 'trip') return '/dispatcher/pending-trips'
  if (category === 'driver') return '/dispatcher/drivers'
  return null
}

export function normalizeNotification(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw._id || raw.id || `notif-${Date.now()}-${index}`
  const title = raw.title || raw.heading || raw.subject || raw.name || 'Notification'
  const message = raw.body || raw.message || raw.description || raw.content || raw.text || ''
  const category = detectCategory(raw)
  const priority = detectPriority(raw)
  const timestamp = raw.createdAt || raw.timestamp || raw.created_at || raw.date || new Date().toISOString()
  const time = raw.time || formatRelativeTime(timestamp)
  const read = Boolean(raw.isRead ?? raw.read ?? (raw.status === 'read' || raw.status === 'READ'))
  const refId = detectRefId(raw)
  const link = detectLink(raw, category)

  return {
    id,
    _id: raw._id || id,
    title,
    message,
    body: message,
    category,
    type: raw.type || 'DISPATCHER_ALERT',
    priority,
    time,
    timestamp,
    read,
    isRead: read,
    link,
    refId,
    user: raw.user,
    userType: raw.userType,
    raw,
  }
}

export const notificationApi = {
  // 1. Fetch authenticated user's notifications
  getMyNotifications: async (params = {}) => {
    try {
      const res = await apiClient.get('/notification/my', params)
      let rawList = []
      let serverUnreadCount = null
      let pagination = null

      if (Array.isArray(res)) {
        rawList = res
      } else if (res && typeof res === 'object') {
        if (Array.isArray(res.notifications)) rawList = res.notifications
        else if (Array.isArray(res.docs)) rawList = res.docs
        else if (Array.isArray(res.data)) rawList = res.data
        else if (Array.isArray(res.result)) rawList = res.result
        else if (Array.isArray(res.list)) rawList = res.list
        else if (Array.isArray(res.items)) rawList = res.items

        if (typeof res.unreadCount === 'number') {
          serverUnreadCount = res.unreadCount
        }
        if (res.pagination) {
          pagination = res.pagination
        }
      }

      const notifications = rawList.map((item, idx) => normalizeNotification(item, idx)).filter(Boolean)

      return {
        notifications,
        unreadCount: serverUnreadCount !== null ? serverUnreadCount : notifications.filter((n) => !n.read).length,
        pagination: pagination || { page: 1, limit: 20, total: notifications.length, pages: 1 },
      }
    } catch (err) {
      console.warn('Failed to fetch /notification/my from backend:', err?.message || err)
      throw err
    }
  },

  // 2. Mark specific notification as read
  markAsRead: async (id) => {
    try {
      return await apiClient.patch(`/notification/${encodeURIComponent(id)}/read`)
    } catch (err) {
      console.warn(`Failed to mark notification ${id} read on backend:`, err?.message || err)
      return null
    }
  },

  // 3. Mark all notifications as read
  markAllAsRead: async () => {
    try {
      return await apiClient.patch('/notification/read-all')
    } catch (err) {
      console.warn('Failed to mark all notifications read on backend:', err?.message || err)
      return null
    }
  },
}
