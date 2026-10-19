import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, RefreshCw, AlertCircle, Phone, Car, CheckCircle2, Coins } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import Table from '@/shared/components/Table'
import StatusBadge from '@/shared/components/StatusBadge'
import Pagination from '@/shared/components/Pagination'
import Button from '@/shared/components/Button'
import { dispatcherApi } from '../../services/dispatcherApi'
import { useDebounce } from '@/shared/hooks/useDebounce'

export default function CompletedTrips() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchCompleted = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await dispatcherApi.getCompletedTrips({
        page,
        limit: 10,
        search: debouncedSearch,
      })
      setTrips(data.trips || [])
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.total || (data.trips || []).length)
    } catch (err) {
      console.error('Failed to fetch completed trips:', err)
      setError(err?.message || 'Failed to load completed trips.')
      setTrips([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchCompleted()
  }, [fetchCompleted])

  const columns = [
    {
      key: 'tripId',
      label: 'Trip ID',
      render: (r) => (
        <div>
          <span className="font-bold text-text-primary text-xs">{r.tripId}</span>
          <p className="text-[10px] text-text-muted">
            {r.createdAt ? new Date(r.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '-'}
          </p>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (r) => (
        <div>
          <p className="font-semibold text-text-primary text-xs">{r.customer?.name || 'Customer'}</p>
          {r.customer?.phone && (
            <p className="text-[10px] text-text-muted flex items-center gap-1">
              <Phone size={10} /> {r.customer?.phone}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'driver',
      label: 'Driver',
      render: (r) => (
        <div>
          <p className="font-semibold text-text-primary text-xs">{r.driver?.name || 'Assigned Driver'}</p>
          <p className="text-[10px] text-text-muted">{r.driver?.vehicleType || 'Standard'} {r.driver?.plate ? `• ${r.driver.plate}` : ''}</p>
        </div>
      ),
    },
    {
      key: 'pickup',
      label: 'Pickup',
      render: (r) => (
        <span className="text-xs text-text-secondary line-clamp-1 max-w-[160px]" title={r.pickup?.address}>
          {r.pickup?.address || 'Pickup Point'}
        </span>
      ),
    },
    {
      key: 'dropoff',
      label: 'Destination',
      render: (r) => (
        <span className="text-xs text-text-secondary line-clamp-1 max-w-[160px]" title={r.dropoff?.address}>
          {r.dropoff?.address || 'Destination'}
        </span>
      ),
    },
    {
      key: 'fare',
      label: 'Paid Fare',
      render: (r) => (
        <div>
          <span className="font-bold text-xs text-emerald-600">
            {r.fare?.amount != null ? `$${r.fare.amount}` : '-'}
          </span>
          <p className="text-[10px] text-text-muted uppercase">{r.fare?.paymentMethod || 'CASH'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status="completed" />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button
          onClick={() => navigate(`/dispatcher/trip-details?tripId=${encodeURIComponent(r.id)}`)}
          className="px-2.5 py-1 text-xs rounded-lg bg-surface border border-border-subtle hover:bg-surface-hover text-text-primary font-medium"
        >
          Details
        </button>
      ),
    },
  ]

  return (
    <PageLayout
      title="Completed Trips"
      description="Review completed rides finished today, driver performance, and collected fares."
      actions={
        <Button variant="secondary" icon={RefreshCw} onClick={fetchCompleted} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button onClick={fetchCompleted} className="underline font-semibold">Retry</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-card p-4 rounded-2xl">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by customer, driver, trip ID, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="text-xs text-text-secondary font-medium">
            Total Completed: <strong className="text-emerald-600">{totalCount}</strong>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <Table
            borderless
            columns={columns}
            rows={trips}
            keyField="id"
            emptyLabel="No completed trips found"
          />
          {totalPages > 1 && (
            <div className="p-4 border-t border-border-subtle">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
