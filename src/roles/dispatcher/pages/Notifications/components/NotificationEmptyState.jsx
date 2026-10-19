import { BellOff, Search, Sparkles } from 'lucide-react'
import Button from '@/shared/components/Button'

export default function NotificationEmptyState({ filterType, searchQuery, onResetFilter, onOpenTestModal }) {
  const isSearching = Boolean(searchQuery && searchQuery.trim())

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/30 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-raised border border-border-subtle text-text-muted mb-4 shadow-sm">
        {isSearching ? <Search size={24} /> : <BellOff size={24} />}
      </div>

      <h3 className="text-base font-semibold text-text-primary">
        {isSearching
          ? 'No matching notifications found'
          : filterType === 'UNREAD'
          ? 'You are all caught up!'
          : 'No notifications to display'}
      </h3>

      <p className="mt-1 max-w-sm text-xs text-text-muted leading-relaxed">
        {isSearching
          ? `We couldn't find any notifications matching "${searchQuery}". Try refining your search query.`
          : filterType === 'UNREAD'
          ? 'All your dispatch notifications and trip alerts have been marked as read.'
          : 'When passengers book rides, drivers update trip states, or messages arrive, they will appear here in real time.'}
      </p>

      <div className="mt-5 flex items-center gap-3">
        {isSearching || filterType !== 'ALL' ? (
          <Button variant="secondary" size="sm" onClick={onResetFilter}>
            Clear filters
          </Button>
        ) : null}

        {onOpenTestModal && (
          <Button variant="primary" size="sm" icon={Sparkles} onClick={onOpenTestModal}>
            Send test notification
          </Button>
        )}
      </div>
    </div>
  )
}
