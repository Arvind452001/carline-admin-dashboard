import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarRange, RefreshCw } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import KpiCard from '@/shared/components/Kpi'
import Table from '@/shared/components/Table'
import StatusBadge from '@/shared/components/StatusBadge'
import Badge from '@/shared/components/Badge'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import EmptyState from '@/shared/components/EmptyState'
import { useAuthStore } from '@/store/authStore'
import { currency } from '@/shared/utils/currency'
import { formatDateTime } from '@/shared/utils/date'
import {
  TIMEFRAME_OPTIONS,
  companyIdFromUser,
  getDashboardOverview,
} from '@/roles/company-admin/services/dashboardApi'

const pad = (value) => String(value).padStart(2, '0')

function isoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// A custom range opens on the current month, so switching to it always has a
// valid pair to send instead of an empty request.
function currentMonthRange() {
  const now = new Date()
  return {
    startDate: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: isoDate(now),
  }
}

// The drivers-online and cancellation cards carry extra counts worth surfacing.
function cardHint(card) {
  if (card.key === 'driversOnline' && card.totalDrivers !== null) {
    return `${card.offlineDrivers ?? 0} offline of ${card.totalDrivers}`
  }
  if (card.key === 'cancellationRate' && card.cancelledCount !== null) {
    return `${card.cancelledCount} cancelled`
  }
  return undefined
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const companyId = useMemo(() => companyIdFromUser(user), [user])

  const [timeframe, setTimeframe] = useState('today')
  const [range, setRange] = useState(currentMonthRange)
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isCustom = timeframe === 'custom'
  const needsDates = isCustom && (!range.startDate || !range.endDate)

  const load = useCallback(async () => {
    if (needsDates) {
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const next = await getDashboardOverview({
        companyId,
        timeframe,
        startDate: range.startDate,
        endDate: range.endDate,
      })
      setOverview(next)
    } catch (err) {
      setError(err.message || 'Could not load the dashboard.')
    } finally {
      setLoading(false)
    }
  }, [companyId, timeframe, needsDates, range.startDate, range.endDate])

  useEffect(() => {
    load()
  }, [load])

  const title = overview?.company?.name ? `${overview.company.name} overview` : 'Company overview'
  const description = overview?.company?.subtitle || "Today's operations for your company."

  const actions = (
    <>
      <Select
        aria-label="Timeframe"
        options={TIMEFRAME_OPTIONS}
        value={timeframe}
        onChange={(event) => setTimeframe(event.target.value)}
        className="h-[38px] !py-1.5"
        containerClassName="w-full sm:w-44"
      />
      <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading || needsDates}>
        Refresh
      </Button>
    </>
  )

  return (
    <PageLayout title={title} description={description} actions={actions}>
      {isCustom && (
        <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface p-4 sm:flex-row sm:items-end">
          <Input
            label="Start date"
            type="date"
            value={range.startDate}
            max={range.endDate || undefined}
            onChange={(event) => setRange((prev) => ({ ...prev, startDate: event.target.value }))}
            containerClassName="w-full sm:w-48"
          />
          <Input
            label="End date"
            type="date"
            value={range.endDate}
            min={range.startDate || undefined}
            onChange={(event) => setRange((prev) => ({ ...prev, endDate: event.target.value }))}
            containerClassName="w-full sm:w-48"
          />
        </div>
      )}

      {loading ? (
        <Loading label="Loading dashboard..." />
      ) : needsDates ? (
        <EmptyState
          icon={CalendarRange}
          title="Pick a date range"
          description="A custom timeframe needs both a start and an end date before the numbers can be loaded."
        />
      ) : error ? (
        <ErrorState title="Could not load the dashboard" description={error} onRetry={load} />
      ) : (
        <>
          {overview?.cards?.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {overview.cards.map((card) => (
                <KpiCard
                  key={card.key}
                  label={card.title}
                  value={card.displayValue}
                  delta={card.delta}
                  trend={card.trend}
                  tone={card.tone}
                  hint={cardHint(card)}
                />
              ))}
            </div>
          )}

          {overview?.breakdown?.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="font-display text-sm font-semibold text-text-primary">Trips breakdown</h2>
                {overview.timeframe && <Badge tone="taxi">{overview.timeframe}</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {overview.breakdown.map((item) => (
                  <div key={item.key} className="rounded-xl border border-border-subtle bg-surface p-3.5">
                    <p className="text-xs text-text-muted">{item.label}</p>
                    <p className="mt-1 font-display text-lg font-semibold text-text-primary">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border-subtle bg-surface p-4">
            <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Recent trips</h2>
            <Table
              columns={[
                {
                  key: 'id',
                  label: 'Trip',
                  render: (row) => (
                    <span className="font-medium text-text-primary" title={row.id}>
                      {row.id.slice(-8)}
                    </span>
                  ),
                },
                { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                { key: 'vehicleType', label: 'Vehicle' },
                {
                  key: 'route',
                  label: 'Route',
                  render: (row) => (
                    <div className="max-w-xs whitespace-normal">
                      <p className="truncate text-text-primary" title={row.pickup}>
                        {row.pickup}
                      </p>
                      <p className="truncate text-xs text-text-muted" title={row.dropoff}>
                        {row.dropoff}
                      </p>
                    </div>
                  ),
                },
                { key: 'fare', label: 'Fare', render: (row) => currency(row.fare) },
                { key: 'paymentMethod', label: 'Payment' },
                {
                  key: 'paymentStatus',
                  label: 'Paid',
                  render: (row) => (row.paymentStatus ? <StatusBadge status={row.paymentStatus} /> : '-'),
                },
                {
                  key: 'createdAt',
                  label: 'Booked',
                  render: (row) => (row.createdAt ? formatDateTime(row.createdAt) : '-'),
                },
              ]}
              rows={overview?.recentTrips || []}
              emptyLabel="No trips in this timeframe"
            />
          </div>
        </>
      )}
    </PageLayout>
  )
}
