import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, Search, RefreshCw, AlertCircle, Clock, MapPin, Phone, Mail, Car, 
  XCircle, Sparkles, User, ExternalLink, Eye, Route, Receipt, UserCheck, 
  Building2, CreditCard, Wallet, Filter, CheckCircle2
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import Table from '@/shared/components/Table'
import StatusBadge from '@/shared/components/StatusBadge'
import Pagination from '@/shared/components/Pagination'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'
import TripQuickModal from '@/roles/dispatcher/components/TripQuickModal'
import { dispatcherApi } from '../../services/dispatcherApi'
import { useDebounce } from '@/shared/hooks/useDebounce'

function formatDate(isoStr) {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return String(isoStr)
  }
}

function formatDateTime(isoStr) {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return String(isoStr)
  }
}

export default function ScheduledTrips() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'assigned' | 'unassigned'

  // Details modal & Cancel modal state
  const [detailsModalTrip, setDetailsModalTrip] = useState(null)
  const [cancelModalTrip, setCancelModalTrip] = useState(null)
  const [cancelReason, setCancelReason] = useState('Customer rescheduled/cancelled')
  const [cancelling, setCancelling] = useState(false)

  const fetchScheduled = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await dispatcherApi.getScheduledTrips({
        page,
        limit: 10,
        search: debouncedSearch,
      })
      setTrips(data.trips || [])
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.total || (data.trips || []).length)
    } catch (err) {
      console.error('Failed to fetch scheduled trips:', err)
      setError(err?.message || 'Failed to load scheduled trips.')
      setTrips([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchScheduled()
  }, [fetchScheduled])

  const handleCancel = async () => {
    if (!cancelModalTrip) return
    try {
      setCancelling(true)
      await dispatcherApi.cancelTrip(cancelModalTrip.id, cancelReason)
      setCancelModalTrip(null)
      fetchScheduled()
    } catch (err) {
      alert(err?.message || 'Failed to cancel scheduled trip')
    } finally {
      setCancelling(false)
    }
  }

  // Filtered trips based on quick filter toggle
  const filteredTrips = trips.filter((t) => {
    if (filterMode === 'assigned') return Boolean(t.driver?.name)
    if (filterMode === 'unassigned') return !t.driver?.name
    return true
  })

  const assignedCount = trips.filter((t) => Boolean(t.driver?.name)).length
  const unassignedCount = trips.filter((t) => !t.driver?.name).length

  const columns = [
    {
      key: 'tripId',
      label: 'TRIP & COMPANY',
      render: (r) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-text-primary text-xs font-mono">{r.tripId}</span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              {r.rideType || 'SCHEDULED'}
            </span>
          </div>
          {r.company?.name && (
            <p className="text-[10px] text-text-muted flex items-center gap-1 truncate max-w-[150px]">
              <Building2 size={10} className="shrink-0 text-text-muted" />
              <span>{r.company.name}</span>
              {r.company.code && <span className="text-[9px] font-mono text-text-muted/70">({r.company.code})</span>}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'CUSTOMER',
      render: (r) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
            <User size={12} className="text-taxi-500 shrink-0" />
            <span className="truncate max-w-[150px]">{r.customer?.name || 'Customer'}</span>
          </p>
          {r.customer?.phone && (
            <a 
              href={`tel:${r.customer.phone}`}
              className="text-[10px] text-text-secondary hover:text-taxi-500 flex items-center gap-1 transition-colors"
            >
              <Phone size={9} className="shrink-0" />
              <span>{r.customer.phone}</span>
            </a>
          )}
          {r.customer?.email && (
            <p className="text-[10px] text-text-muted flex items-center gap-1 truncate max-w-[150px]">
              <Mail size={9} className="shrink-0" />
              <span className="truncate">{r.customer.email}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'driver',
      label: 'ASSIGNED DRIVER & VEHICLE',
      render: (r) => (
        <div>
          {r.driver ? (
            <div className="space-y-0.5">
              <p className="font-semibold text-text-primary text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate max-w-[140px]">{r.driver.name}</span>
              </p>
              {r.driver.phone && (
                <a 
                  href={`tel:${r.driver.phone}`} 
                  className="text-[10px] text-text-secondary hover:text-emerald-500 flex items-center gap-1 transition-colors"
                >
                  <Phone size={9} className="shrink-0" />
                  <span>{r.driver.phone}</span>
                </a>
              )}
              <div className="flex items-center gap-1 text-[10px] text-text-muted pt-0.5">
                <Car size={10} className="shrink-0 text-taxi-500" />
                <span className="font-medium text-text-secondary truncate max-w-[110px]">
                  {r.driver.vehicleType || r.vehicleType || 'Standard'}
                </span>
                {r.driver.plate && (
                  <span className="font-mono bg-surface-raised px-1 py-0.2 rounded border border-border-subtle text-[9px]">
                    {r.driver.plate}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Awaiting Driver
              </span>
              <p className="text-[10px] text-text-muted flex items-center gap-1">
                <Car size={10} /> {r.vehicleType || 'Sedan Comfort'}
              </p>
            </div>
          )}
        </div>
      ),
    },
   
   
    {
      key: 'fare',
      label: 'FARE & PAYMENT',
      render: (r) => (
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-text-primary">
            {r.fare?.displayFare || (r.fare?.amount != null ? `$${r.fare.amount}` : '$0')}
          </p>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-text-secondary">
              {r.fare?.paymentMethod || 'WALLET'}
            </span>
            <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
              r.fare?.paymentStatus === 'paid' || r.fare?.paymentStatus === 'completed'
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-amber-500/10 text-amber-500'
            }`}>
              {r.fare?.paymentStatus || 'PENDING'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (r) => (
        <div className="space-y-1">
          <StatusBadge status={r.statusSlug || 'scheduled'} />
          {r.rawStatus && r.rawStatus !== 'SCHEDULED' && (
            <span className="block text-[9px] font-medium text-amber-500/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 truncate max-w-[120px]" title={r.rawStatus}>
              {r.rawStatus === 'SEARCHING_DRIVER' ? 'Searching Driver' : r.rawStatus}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      sticky: 'right',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {/* Quick Record Modal */}
          <button
            onClick={() => setDetailsModalTrip(r)}
            className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border-strong text-text-secondary hover:text-text-primary transition-all"
            title="Quick view full record"
          >
            <Eye size={13} />
          </button>

          {/* Standalone Page Button */}
          <button
            onClick={() => navigate(`/dispatcher/trip-details?tripId=${encodeURIComponent(r.id)}`)}
            className="px-2.5 py-1 text-xs rounded-lg bg-surface border border-border-subtle hover:bg-surface-hover text-text-primary font-medium flex items-center gap-1 transition-all"
            title="Open Dedicated Trip Details Page"
          >
            <span>Details</span>
            <ExternalLink size={11} />
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => setCancelModalTrip(r)}
            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-all"
            title="Cancel this scheduled trip"
          >
            <XCircle size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageLayout
      title="Scheduled Trips"
      description="Review upcoming scheduled bookings, adjust dispatch times, or assign drivers in advance."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={fetchScheduled} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button icon={Sparkles} onClick={() => navigate('/dispatcher/manual-booking')}>
            New Booking
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button onClick={fetchScheduled} className="underline font-semibold">Retry</button>
          </div>
        )}

        {/* Quick Interactive KPI Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => setFilterMode('all')}
            className={`glass-card p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
              filterMode === 'all' 
                ? 'border-indigo-500/50 ring-2 ring-indigo-500/20 bg-surface-raised' 
                : 'hover:border-border-strong'
            }`}
          >
            <div>
              <p className="text-xs text-text-muted">Total Scheduled Bookings</p>
              <h3 className="text-xl font-bold text-text-primary mt-1">{totalCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Calendar size={20} />
            </div>
          </div>

          <div 
            onClick={() => setFilterMode('assigned')}
            className={`glass-card p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
              filterMode === 'assigned' 
                ? 'border-emerald-500/50 ring-2 ring-emerald-500/20 bg-surface-raised' 
                : 'hover:border-border-strong'
            }`}
          >
            <div>
              <p className="text-xs text-text-muted">Drivers Assigned</p>
              <h3 className="text-xl font-bold text-emerald-500 mt-1">
                {assignedCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
          </div>

          <div 
            onClick={() => setFilterMode('unassigned')}
            className={`glass-card p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
              filterMode === 'unassigned' 
                ? 'border-amber-500/50 ring-2 ring-amber-500/20 bg-surface-raised' 
                : 'hover:border-border-strong'
            }`}
          >
            <div>
              <p className="text-xs text-text-muted">Awaiting Driver Assignment</p>
              <h3 className="text-xl font-bold text-amber-500 mt-1">
                {unassignedCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
        </div>

        {/* Search, Filter Pills & Counter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-card p-4 rounded-2xl">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search customer, ID, driver, address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterMode === 'all'
                  ? 'bg-taxi-500 text-black font-bold shadow-sm'
                  : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border-subtle'
              }`}
            >
              All ({trips.length})
            </button>
            <button
              onClick={() => setFilterMode('assigned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterMode === 'assigned'
                  ? 'bg-emerald-500 text-white font-bold shadow-sm'
                  : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border-subtle'
              }`}
            >
              Assigned ({assignedCount})
            </button>
            <button
              onClick={() => setFilterMode('unassigned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterMode === 'unassigned'
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border-subtle'
              }`}
            >
              Awaiting ({unassignedCount})
            </button>
          </div>
        </div>

        {/* Trips Table */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <Table
            borderless
            columns={columns}
            rows={filteredTrips}
            keyField="id"
            emptyLabel="No scheduled trips found matching current filters"
          />
          {totalPages > 1 && (
            <div className="p-4 border-t border-border-subtle">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {/* QUICK FULL RECORD MODAL */}
      <TripQuickModal
        trip={detailsModalTrip}
        open={!!detailsModalTrip}
        onClose={() => setDetailsModalTrip(null)}
      />

      {/* Cancel Modal */}
      {cancelModalTrip && (
        <Modal
          open={true}
          onClose={() => setCancelModalTrip(null)}
          title={`Cancel Scheduled Trip ${cancelModalTrip.tripId}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Are you sure you want to cancel scheduled trip <strong>{cancelModalTrip.tripId}</strong> for <strong>{cancelModalTrip.customer?.name}</strong>?
            </p>
            <div>
              <label className="block font-semibold text-text-primary mb-1">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface border border-border-strong text-text-primary text-xs focus:ring-2 focus:ring-taxi-500 outline-none"
              >
                <option value="Customer rescheduled/cancelled">Customer rescheduled/cancelled</option>
                <option value="No driver available for scheduled time">No driver available for scheduled time</option>
                <option value="Duplicate booking request">Duplicate booking request</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
              <Button variant="secondary" onClick={() => setCancelModalTrip(null)}>
                Keep Trip
              </Button>
              <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
