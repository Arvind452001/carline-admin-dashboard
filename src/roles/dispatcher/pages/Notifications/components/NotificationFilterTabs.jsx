import { NOTIFICATION_TYPES } from '@/shared/utils/notificationUtils'

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

export default function NotificationFilterTabs({
  activeFilter,
  onFilterChange,
  notifications = [],
  unreadCount = 0,
}) {
  const tripCount = notifications.filter((n) => TRIP_TYPES.includes(n.type)).length
  const chatCount = notifications.filter((n) => n.type === NOTIFICATION_TYPES.CHAT_MESSAGE).length
  const systemCount = notifications.filter(
    (n) => n.type === NOTIFICATION_TYPES.SYSTEM || n.type === NOTIFICATION_TYPES.TEST_PUSH
  ).length

  const tabs = [
    { key: 'ALL', label: 'All', count: notifications.length },
    { key: 'UNREAD', label: 'Unread', count: unreadCount, highlight: unreadCount > 0 },
    { key: 'TRIPS', label: 'Trip Updates', count: tripCount },
    { key: 'CHAT', label: 'Chat Messages', count: chatCount },
    { key: 'SYSTEM', label: 'System & Tests', count: systemCount },
  ]

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.key

        return (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-taxi-500 text-white shadow-sm shadow-taxi-500/20 font-semibold'
                : 'bg-surface hover:bg-surface-raised text-text-secondary border border-border-subtle hover:text-text-primary'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : tab.highlight
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-surface-raised text-text-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
