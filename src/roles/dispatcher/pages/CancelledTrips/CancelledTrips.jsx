import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, RefreshCw, AlertCircle, Phone, Car, XCircle, Trash2 } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import Table from '@/shared/components/Table'
import StatusBadge from '@/shared/components/StatusBadge'
import Pagination from '@/shared/components/Pagination'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'
import { dispatcherApi } from '../../services/dispatcherApi'
import { useDebounce } from '@/shared/hooks/useDebounce'

export default function CancelledTrips() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Delete modal state
  const [deleteModalTrip, setDeleteModalTrip] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCancelled = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await dispatcherApi.getCancelledTrips({
        page,
        limit: 10,
        search: debouncedSearch,
      })
      setTrips(data.trips || [])
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.total || (data.trips || []).length)
    } catch (err) {
      console.error('Failed to fetch cancelled trips:', err)
      setError(err?.message || 'Failed to load cancelled trips.')
      setTrips([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchCancelled()
  }, [fetchCancelled])

  const handleDelete = async () => {
    if (!deleteModalTrip) return
    try {
      setDeleting(true)
      await dispatcherApi.deleteTrip(deleteModalTrip.id)
      setDeleteModalTrip(null)
      fetchCancelled()
    } catch (err) {
      alert(err?.message || 'Failed to delete trip record')
    } finally {
      setDeleting(false)
    }
  }

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
      key: 'cancelReason',
      label: 'Cancellation Reason',
      render: (r) => (
        <span className="text-xs text-signal-red font-medium line-clamp-1 max-w-[180px]" title={r.cancelReason || 'Cancelled'}>
          {r.cancelReason || 'Customer/Driver Cancelled'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status="cancelled" />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/dispatcher/trip-details?tripId=${encodeURIComponent(r.id)}`)}
            className="px-2.5 py-1 text-xs rounded-lg bg-surface border border-border-subtle hover:bg-surface-hover text-text-primary font-medium"
          >
            Details
          </button>
          <button
            onClick={() => setDeleteModalTrip(r)}
            className="p-1 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 font-medium"
            title="Delete record"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageLayout
      title="Cancelled Trips"
      description="Review cancelled bookings, logs, and cancellation reasons."
      actions={
        <Button variant="secondary" icon={RefreshCw} onClick={fetchCancelled} disabled={loading}>
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
            <button onClick={fetchCancelled} className="underline font-semibold">Retry</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-card p-4 rounded-2xl">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by customer, trip ID, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="text-xs text-text-secondary font-medium">
            Total Cancelled: <strong className="text-signal-red">{totalCount}</strong>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <Table
            borderless
            columns={columns}
            rows={trips}
            keyField="id"
            emptyLabel="No cancelled trips found"
          />
          {totalPages > 1 && (
            <div className="p-4 border-t border-border-subtle">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {deleteModalTrip && (
        <Modal
          open={true}
          onClose={() => setDeleteModalTrip(null)}
          title={`Delete Trip Record ${deleteModalTrip.tripId}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Are you sure you want to permanently delete booking record <strong>{deleteModalTrip.tripId}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
              <Button variant="secondary" onClick={() => setDeleteModalTrip(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Record'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
