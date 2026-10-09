import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import Search from '@/shared/components/Search'
import Filter from '@/shared/components/Filter'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import Pagination from '@/shared/components/Pagination'
import DatePicker from '@/shared/components/DatePicker'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { formatDateTime } from '@/shared/utils/date'
import { currencyPrecise } from '@/shared/utils/currency'
import { titleCase } from '@/shared/utils/formatting'
import { TRIP_STATUS_TABS, listCompanyTrips } from '@/roles/company-admin/services/tripApi'

const PAGE_SIZE = 10

const EMPTY_COUNTS = { all: 0, pending: 0, dispatched: 0, ongoing: 0, completed: 0, cancelled: 0, scheduled: 0 }
const EMPTY_RESULT = { trips: [], statusCounts: EMPTY_COUNTS, total: 0, totalPages: 1 }

export default function Trips() {
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)

  const [result, setResult] = useState(EMPTY_RESULT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const debouncedQuery = useDebounce(query, 300)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listCompanyTrips({
        page,
        limit: PAGE_SIZE,
        search: debouncedQuery,
        status,
        startDate,
        endDate,
      })
      setResult(data)
      // A refresh can leave the last page empty (a booking moved out of the
      // filter), so fall back to the last page the API still reports.
      if (page > data.totalPages) setPage(data.totalPages)
    } catch (err) {
      setResult(EMPTY_RESULT)
      setError(err.message || 'Could not load trips.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedQuery, status, startDate, endDate])

  useEffect(() => {
    load()
  }, [load])

  // Every filter restarts from the first page, so nothing has to react to a
  // page number that the new filter no longer has.
  function apply(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }

  const changeQuery = apply(setQuery)
  const changeStatus = apply(setStatus)
  const changeStartDate = apply(setStartDate)
  const changeEndDate = apply(setEndDate)

  function clearDates() {
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  // The API counts every tab against the same search and date filters, so the
  // numbers stay put while switching tabs.
  const filterOptions = TRIP_STATUS_TABS.map((tab) => ({
    value: tab.value,
    label: `${tab.label} (${result.statusCounts[tab.countKey] ?? 0})`,
  }))

  const description = loading
    ? 'Trips booked through your company.'
    : `${result.total} ${result.total === 1 ? 'trip' : 'trips'} found.`

  const actions = (
    <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>
      Refresh
    </Button>
  )

  const hasDates = Boolean(startDate || endDate)

  return (
    <PageLayout title="Trips" description={description} actions={actions}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Search value={query} onChange={changeQuery} placeholder="Search trip, customer, driver, address..." />
        <div className="flex flex-wrap items-end gap-2">
          <DatePicker label="From" value={startDate} onChange={changeStartDate} />
          <DatePicker label="To" value={endDate} onChange={changeEndDate} />
          {hasDates && (
            <Button variant="secondary" icon={X} onClick={clearDates} className="mb-0.5">
              Clear
            </Button>
          )}
        </div>
      </div>

      <Filter options={filterOptions} value={status} onChange={changeStatus} />

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-signal-red/20 bg-signal-red/5 px-4 py-3 text-xs text-text-secondary">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-signal-red" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <Loading label="Loading trips..." />
      ) : error ? (
        <ErrorState title="Could not load trips" description={error} onRetry={load} />
      ) : (
        <>
          <Table
            columns={[
              {
                key: 'tripId',
                label: 'Trip',
                render: (row) => (
                  <div>
                    <p className="font-medium text-text-primary">{row.tripId}</p>
                    <p className="text-xs text-text-muted">{titleCase(row.rideType)}</p>
                  </div>
                ),
              },
              {
                key: 'customer',
                label: 'Customer',
                render: (row) => (
                  <div>
                    <p className="text-text-primary">{row.customer.name}</p>
                    {row.customer.phone && <p className="text-xs text-text-muted">{row.customer.phone}</p>}
                  </div>
                ),
              },
              {
                key: 'driver',
                label: 'Driver',
                render: (row) =>
                  row.driver ? (
                    <div>
                      <p className="text-text-primary">{row.driver.name}</p>
                      <p className="text-xs text-text-muted">
                        {[row.driver.vehicleType, row.driver.plate].filter(Boolean).join(' - ') || '-'}
                      </p>
                    </div>
                  ) : (
                    <span className="text-text-muted">Not assigned</span>
                  ),
              },
              {
                key: 'route',
                label: 'Route',
                render: (row) => (
                  <div className="max-w-xs">
                    <p className="truncate text-text-primary" title={row.pickup.address}>
                      {row.pickup.address || '-'}
                    </p>
                    <p className="truncate text-xs text-text-muted" title={row.dropoff.address}>
                      to {row.dropoff.address || '-'}
                    </p>
                  </div>
                ),
              },
              {
                key: 'fare',
                label: 'Fare',
                render: (row) => (
                  <div>
                    <p className="text-text-primary">{currencyPrecise(row.fare.amount)}</p>
                    <p className="text-xs text-text-muted">{titleCase(row.fare.paymentMethod) || '-'}</p>
                  </div>
                ),
              },
              {
                key: 'paymentStatus',
                label: 'Payment',
                render: (row) => <StatusBadge status={row.fare.paymentStatus} />,
              },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.statusSlug} /> },
              {
                key: 'createdAt',
                label: 'Booked',
                render: (row) => (row.createdAt ? formatDateTime(row.createdAt) : '-'),
              },
              {
                key: 'action',
                label: 'Action',
                sticky: 'right',
                render: (row) => (
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/company-admin/trips/${row.id}`)}>
                    View Details
                  </Button>
                ),
              },
            ]}
            rows={result.trips}
            emptyLabel={hasDates || debouncedQuery || status !== 'All' ? 'No trips match these filters' : 'No trips booked yet'}
          />
          <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
        </>
      )}
    </PageLayout>
  )
}
