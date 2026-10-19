import {
  Car,
  UserCheck,
  MapPin,
  Play,
  Flag,
  CheckCircle2,
  XCircle,
  MessageSquare,
  BellRing,
  Sparkles,
  Bell
} from 'lucide-react'

export const NOTIFICATION_TYPES = {
  RIDE_BOOKED: 'RIDE_BOOKED',
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  DRIVER_ARRIVED: 'DRIVER_ARRIVED',
  TRIP_STARTED: 'TRIP_STARTED',
  DESTINATION_REACHED: 'DESTINATION_REACHED',
  TRIP_COMPLETED: 'TRIP_COMPLETED',
  RIDE_CANCELLED: 'RIDE_CANCELLED',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  RIDE_REQUEST: 'RIDE_REQUEST',
  TEST_PUSH: 'TEST_PUSH',
  SYSTEM: 'SYSTEM',
}

export const NOTIFICATION_TYPE_META = {
  [NOTIFICATION_TYPES.RIDE_BOOKED]: {
    label: 'Ride Confirmed',
    icon: Car,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    defaultRoute: '/dispatcher/pending-trips',
  },
  [NOTIFICATION_TYPES.DRIVER_ASSIGNED]: {
    label: 'Driver Assigned',
    icon: UserCheck,
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-400',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    defaultRoute: '/dispatcher/live-trips',
  },
  [NOTIFICATION_TYPES.DRIVER_ARRIVED]: {
    label: 'Driver Arrived',
    icon: MapPin,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    defaultRoute: '/dispatcher/live-trips',
  },
  [NOTIFICATION_TYPES.TRIP_STARTED]: {
    label: 'Trip Started',
    icon: Play,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    defaultRoute: '/dispatcher/live-trips',
  },
  [NOTIFICATION_TYPES.DESTINATION_REACHED]: {
    label: 'Destination Reached',
    icon: Flag,
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    defaultRoute: '/dispatcher/live-trips',
  },
  [NOTIFICATION_TYPES.TRIP_COMPLETED]: {
    label: 'Trip Completed',
    icon: CheckCircle2,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    defaultRoute: '/dispatcher/completed-trips',
  },
  [NOTIFICATION_TYPES.RIDE_CANCELLED]: {
    label: 'Ride Cancelled',
    icon: XCircle,
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    defaultRoute: '/dispatcher/cancelled-trips',
  },
  [NOTIFICATION_TYPES.CHAT_MESSAGE]: {
    label: 'Chat Message',
    icon: MessageSquare,
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    defaultRoute: '/dispatcher/live-trips',
  },
  [NOTIFICATION_TYPES.RIDE_REQUEST]: {
    label: 'New Ride Request',
    icon: BellRing,
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-400',
    badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    defaultRoute: '/dispatcher/pending-trips',
  },
  [NOTIFICATION_TYPES.TEST_PUSH]: {
    label: 'Test Push',
    icon: Sparkles,
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/20',
    text: 'text-fuchsia-400',
    badge: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
    defaultRoute: '/dispatcher/notifications',
  },
  [NOTIFICATION_TYPES.SYSTEM]: {
    label: 'System Alert',
    icon: Bell,
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/20',
    text: 'text-zinc-400',
    badge: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
    defaultRoute: '/dispatcher/notifications',
  },
}

export function getNotificationMeta(rawType) {
  const normalized = String(rawType || '').trim().toUpperCase()
  return (
    NOTIFICATION_TYPE_META[normalized] || {
      label: normalized ? normalized.replace(/_/g, ' ') : 'Notification',
      icon: Bell,
      bg: 'bg-taxi-500/10',
      border: 'border-taxi-500/20',
      text: 'text-taxi-400',
      badge: 'bg-taxi-500/15 text-taxi-300 border-taxi-500/30',
      defaultRoute: '/dispatcher/notifications',
    }
  )
}

export function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Just now'
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) {
    // If it's already a relative string like '5m ago'
    return String(dateInput)
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 30) return 'Just now'
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(dateInput) {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return String(dateInput)

  return date.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function normalizeNotification(raw) {
  if (!raw) return null
  const id = raw._id || raw.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const isRead = Boolean(raw.isRead ?? raw.read ?? false)
  const createdAt = raw.createdAt || raw.created_at || raw.timestamp || new Date().toISOString()
  const type = String(raw.type || raw.data?.type || 'SYSTEM').toUpperCase()
  const data = raw.data && typeof raw.data === 'object' ? raw.data : {}

  return {
    id,
    _id: id,
    title: raw.title || 'Notification',
    body: raw.body || raw.message || '',
    type,
    data,
    isRead,
    read: isRead, // maintains backwards compatibility
    createdAt,
    time: raw.time || formatRelativeTime(createdAt),
    readAt: raw.readAt || null,
  }
}

export function getNotificationTargetRoute(notification, role = 'dispatcher') {
  if (!notification) return `/${role}/notifications`
  const data = notification.data || {}

  // Direct ride details if rideId is present
  if (data.rideId) {
    return `/${role}/trip-details?tripId=${encodeURIComponent(data.rideId)}`
  }

  const meta = getNotificationMeta(notification.type)
  if (meta?.defaultRoute) {
    return meta.defaultRoute.replace('/dispatcher', `/${role}`)
  }

  return `/${role}/notifications`
}
