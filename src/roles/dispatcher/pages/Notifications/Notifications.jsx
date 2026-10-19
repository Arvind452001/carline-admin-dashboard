import { useState, useEffect, useMemo } from 'react'
import {
  CheckCheck,
  RefreshCw,
  Sparkles,
  Search,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import { useNotificationStore } from '@/store/notificationStore'
import { NOTIFICATION_TYPES } from '@/shared/utils/notificationUtils'
import NotificationCard from './components/NotificationCard'
import NotificationFilterTabs from './components/NotificationFilterTabs'
import NotificationEmptyState from './components/NotificationEmptyState'
import TestNotificationModal from './components/TestNotificationModal'

const TRIP_TYPES = [
  NOTIFICATION_TYPES.RIDE_BOOKED,
  NOTIFICATION_TYPES.DRIVER_ASSIGNED,
  NOTIFICATION_TYPES.DRIVER_ARRIVED,
  NOTIFICATION_TYPES.TRIP_STARTED,
  NOTIFICATION_TYPES.DESTINATION_REACHED,
  NOTIFICATION_TYPES.TRIP_COMPLETED,
  NOTIFICATION_TYPES.RIDE_CANCELLED,
  NOTIFICATION_TYPES.RIDE_REQUEST,
]

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    total,
    page,
    limit,
    loading,
    refreshing,
    isSocketConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore()

  const [activeFilter, setActiveFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [testModalOpen, setTestModalOpen] = useState(false)

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications({ page: 1, limit: 20 })
  }, [fetchNotifications])

  // Filtered notifications calculation
  const filteredNotifications = useMemo(() => {
    let list = notifications || []

    // 1. Filter by category
    if (activeFilter === 'UNREAD') {
      list = list.filter((n) => !n.isRead && !n.read)
    } else if (activeFilter === 'TRIPS') {
      list = list.filter((n) => TRIP_TYPES.includes(n.type))
    } else if (activeFilter === 'CHAT') {
      list = list.filter((n) => n.type === NOTIFICATION_TYPES.CHAT_MESSAGE)
    } else if (activeFilter === 'SYSTEM') {
      list = list.filter(
        (n) => n.type === NOTIFICATION_TYPES.SYSTEM || n.type === NOTIFICATION_TYPES.TEST_PUSH
      )
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((n) => {
        const titleMatch = (n.title || '').toLowerCase().includes(q)
        const bodyMatch = (n.body || '').toLowerCase().includes(q)
        const typeMatch = (n.type || '').toLowerCase().includes(q)
        const rideIdMatch = String(n.data?.rideId || '').toLowerCase().includes(q)
        const otpMatch = String(n.data?.otp || '').includes(q)
        return titleMatch || bodyMatch || typeMatch || rideIdMatch || otpMatch
      })
    }

    return list
  }, [notifications, activeFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  function handlePageChange(newPage) {
    if (newPage < 1 || newPage > totalPages) return
    fetchNotifications({ page: newPage, limit })
  }

  return (
    <PageLayout
      title="Notification Center"
      description="Real-time dispatch alerts, trip updates, driver status changes, and customer events."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={Sparkles}
            onClick={() => setTestModalOpen(true)}
          >
            Send test notification
          </Button>

          <Button
            variant="secondary"
            icon={CheckCheck}
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
          >
            Mark all read
          </Button>

          <Button
            variant="secondary"
            icon={RefreshCw}
            disabled={loading || refreshing}
            onClick={() => fetchNotifications({ page, limit, silent: false })}
          >
            {loading || refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Top Control Bar: Status indicator, Search, and Counters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Real-time sync badge */}
            <div
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium border ${
                isSocketConnected
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-500/10 border-zinc-500/20 text-text-muted'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'
                }`}
              />
              <span className="flex items-center gap-1 font-semibold">
                {isSocketConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
                {isSocketConnected ? 'Live Socket Sync' : 'Reconnecting Socket...'}
              </span>
            </div>

            {/* Unread badge count */}
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {unreadCount} Unread Alerts
              </span>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search notifications, rides, OTP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border-strong bg-surface-raised pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-taxi-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <NotificationFilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          notifications={notifications}
          unreadCount={unreadCount}
        />

        {/* Notification Cards List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 w-full rounded-2xl border border-border-subtle bg-surface animate-pulse"
              />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <NotificationEmptyState
            filterType={activeFilter}
            searchQuery={searchQuery}
            onResetFilter={() => {
              setActiveFilter('ALL')
              setSearchQuery('')
            }}
            onOpenTestModal={() => setTestModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id || notification._id}
                notification={notification}
                onMarkRead={markAsRead}
              />
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border-subtle pt-4 px-1">
            <span className="text-xs text-text-muted">
              Showing page <span className="font-semibold text-text-primary">{page}</span> of{' '}
              <span className="font-semibold text-text-primary">{totalPages}</span> ({total} total)
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={page <= 1 || loading}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                disabled={page >= totalPages || loading}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Test Notification Drawer / Modal */}
      <TestNotificationModal
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
      />
    </PageLayout>
  )
}
