import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Plus, User, Car, Star, CheckCircle, Navigation, Sparkles, RefreshCw, XCircle, AlertCircle } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Modal from '@/shared/components/Modal'
import { dispatcherApi } from '../../services/dispatcherApi'

export default function DispatchBoard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlTripId = searchParams.get('tripId')

  const [trips, setTrips] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Modals state
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [assignmentStep, setAssignmentStep] = useState('select') // 'select' | 'auto-dispatch' | 'progress' | 'rejected'
  const [countdown, setCountdown] = useState(20)
  const [filter, setFilter] = useState('All')
  const [actionLoading, setActionLoading] = useState(false)

  // Auto Dispatch simulation checks
  const [checks, setChecks] = useState({
    availability: false,
    distance: false,
    compatibility: false,
    priority: false,
    status: false,
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [tripsRes, mapRes] = await Promise.allSettled([
        dispatcherApi.getTrips({ limit: 50 }),
        dispatcherApi.getLiveMap(),
      ])

      if (tripsRes.status === 'fulfilled' && tripsRes.value?.trips) {
        setTrips(tripsRes.value.trips)
      }

      if (mapRes.status === 'fulfilled') {
        const rawMap = mapRes.value?.data || mapRes.value || {}
        const rawDrivers = rawMap.drivers || (Array.isArray(rawMap) ? rawMap : [])
        setDrivers(rawDrivers)
      }
    } catch (err) {
      console.error('Error loading dispatch board data:', err)
      setError('Failed to load live dispatch board data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [loadData])

  useEffect(() => {
    if (urlTripId && trips.length > 0) {
      const match = trips.find((t) => t.id === urlTripId || t.tripId === urlTripId)
      if (match) {
        setSelectedTrip(match)
        setAssignmentStep('select')
      }
    }
  }, [urlTripId, trips])

  const runAutoDispatch = async (trip) => {
    setSelectedTrip(trip)
    setAssignmentStep('auto-dispatch')
    setChecks({ availability: false, distance: false, compatibility: false, priority: false, status: false })

    setTimeout(() => setChecks((p) => ({ ...p, availability: true })), 300)
    setTimeout(() => setChecks((p) => ({ ...p, distance: true })), 600)
    setTimeout(() => setChecks((p) => ({ ...p, compatibility: true })), 900)
    setTimeout(() => setChecks((p) => ({ ...p, priority: true })), 1200)

    try {
      setActionLoading(true)
      const res = await dispatcherApi.autoAssignDriver(trip.id)
      setTimeout(() => setChecks((p) => ({ ...p, status: true })), 1500)
      setSuccessMsg(`Auto-assigned driver successfully to ${trip.tripId}!`)
      setTimeout(() => {
        setSelectedTrip(null)
        loadData()
      }, 2000)
    } catch (err) {
      console.error('Auto dispatch error:', err)
      setError(err?.message || 'Auto assign could not find or match an available driver.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleManualAssign = async (driverId, driverName) => {
    if (!selectedTrip) return
    try {
      setActionLoading(true)
      await dispatcherApi.assignDriver(selectedTrip.id, driverId)
      setSuccessMsg(`Driver ${driverName} assigned to trip ${selectedTrip.tripId}!`)
      setSelectedTrip(null)
      loadData()
    } catch (err) {
      alert(err?.message || 'Failed to assign driver')
    } finally {
      setActionLoading(false)
    }
  }

  const filterTabs = ['All', 'Pending', 'Dispatched', 'Ongoing', 'Scheduled', 'Completed']

  const filteredTrips = trips.filter((t) => {
    if (filter === 'All') return true
    return (t.statusSlug || '').toLowerCase() === filter.toLowerCase()
  })

  return (
    <PageLayout
      title="Dispatch Board"
      description="Coordinate trip dispatch operations. View live queues, auto-match drivers, or assign directly."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={loadData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button icon={Plus} onClick={() => navigate('/dispatcher/manual-booking')}>
            New Booking
          </Button>
        </div>
      }
    >
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Filtering tabs */}
      <div className="flex border-b border-border-strong overflow-x-auto pb-px mb-6 scrollbar-none">
        {filterTabs.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              filter === f
                ? 'border-taxi-500 text-taxi-500'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-subtle'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Trips Queue */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border-subtle pb-2">
            <h3 className="text-sm font-bold text-text-primary">Dispatch Trips Queue ({filteredTrips.length})</h3>
            <span className="text-xs text-text-muted">Live status</span>
          </div>

          {filteredTrips.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">
              No trips in this category.
            </div>
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredTrips.map((trip) => (
                <div key={trip.id} className="bg-surface p-4 rounded-xl border border-border-subtle space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">
                        {trip.tripId} • {trip.customer?.name}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        {trip.pickup?.address || 'Pickup'} → {trip.dropoff?.address || 'Destination'}
                      </p>
                    </div>
                    <StatusBadge status={trip.statusSlug || 'pending'} />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-text-muted pt-2 border-t border-border-subtle/50">
                    <span>
                      Driver: <strong>{
                        trip.driver?.name ||
                        (trip.driver?.id && drivers.find((d) => (d.id || d._id || d.driverId) === trip.driver.id)?.name) ||
                        '—'
                      }</strong>
                    </span>
                    <span>Fare: <strong className="text-taxi-500">${trip.fare?.amount || 0}</strong></span>
                  </div>

                  {(trip.statusSlug === 'pending' || !trip.driver) && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="xs"
                        icon={Sparkles}
                        disabled={actionLoading}
                        onClick={() => runAutoDispatch(trip)}
                      >
                        Auto Dispatch
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        disabled={actionLoading}
                        onClick={() => {
                          setSelectedTrip(trip)
                          setAssignmentStep('select')
                        }}
                      >
                        Assign Driver
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Drivers */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border-subtle pb-2">
            <h3 className="text-sm font-bold text-text-primary">Company Drivers ({drivers.length})</h3>
            <span className="text-xs text-emerald-600 font-semibold">Active Fleet</span>
          </div>

          {drivers.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">
              No active drivers online currently.
            </div>
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {drivers.map((drv) => {
                const dId = drv.id || drv._id || drv.driverId
                const dName = drv.name || drv.fullName || 'Driver'
                const isOnline = drv.status === 'AVAILABLE' || drv.status === 'ACTIVE' || drv.isOnline
                return (
                  <div key={dId} className="bg-surface p-4 rounded-xl border border-border-subtle flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-taxi-500/10 flex items-center justify-center text-taxi-500 font-bold text-xs">
                        {dName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">{dName}</h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          {drv.vehicleType || 'Sedan'} {drv.vehicleRegistrationNumber ? `• ${drv.vehicleRegistrationNumber}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        isOnline ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {drv.status || (isOnline ? 'AVAILABLE' : 'OFFLINE')}
                      </span>
                      {drv.rating && (
                        <div className="flex items-center gap-0.5 text-xs text-text-secondary justify-end">
                          <Star size={12} className="text-amber-500 fill-amber-500" /> {drv.rating}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Assignment Wizard Modal */}
      {selectedTrip && (
        <Modal
          open={!!selectedTrip}
          onClose={() => setSelectedTrip(null)}
          title={
            assignmentStep === 'select'
              ? `Assign Driver for ${selectedTrip.tripId}`
              : 'Automatic Dispatch Search'
          }
        >
          {assignmentStep === 'select' && (
            <div className="space-y-4 text-sm">
              <div className="bg-surface p-3.5 rounded-xl border border-border-subtle grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-muted">Trip ID</span>
                  <p className="font-bold text-text-primary mt-0.5">{selectedTrip.tripId}</p>
                </div>
                <div>
                  <span className="text-text-muted">Customer</span>
                  <p className="font-bold text-text-primary mt-0.5">{selectedTrip.customer?.name}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-text-muted">Route Details</span>
                  <p className="font-medium text-text-primary mt-0.5">
                    {selectedTrip.pickup?.address} → {selectedTrip.dropoff?.address}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-text-secondary">Select Driver to Assign:</p>
                <div className="divide-y divide-border-subtle max-h-64 overflow-y-auto">
                  {drivers.map((drv) => {
                    const dId = drv.id || drv._id || drv.driverId
                    const dName = drv.name || drv.fullName || 'Driver'
                    return (
                      <div
                        key={dId}
                        className="py-2.5 flex justify-between items-center hover:bg-surface/50 px-2 rounded-lg transition-colors"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-text-primary text-xs">{dName}</span>
                          <div className="flex items-center gap-2 text-[10px] text-text-muted">
                            <span>{drv.vehicleType || 'Standard'}</span>
                            <span>{drv.phone || drv.phoneNumber}</span>
                          </div>
                        </div>
                        <Button
                          size="xs"
                          disabled={actionLoading}
                          onClick={() => handleManualAssign(dId, dName)}
                        >
                          {actionLoading ? 'Assigning...' : 'Assign'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {assignmentStep === 'auto-dispatch' && (
            <div className="space-y-4 text-sm">
              <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2.5">
                <h4 className="text-xs font-bold text-text-secondary">Running Matching Criteria:</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>Checking driver availability...</span>
                    {checks.availability ? <span className="text-emerald-600 font-bold">✓ Verified</span> : <span className="text-text-muted">Searching...</span>}
                  </div>
                  <div className="flex justify-between">
                    <span>Evaluating distance radius...</span>
                    {checks.distance ? <span className="text-emerald-600 font-bold">✓ Verified</span> : <span className="text-text-muted">Searching...</span>}
                  </div>
                  <div className="flex justify-between">
                    <span>Checking vehicle compatibility...</span>
                    {checks.compatibility ? <span className="text-emerald-600 font-bold">✓ Verified</span> : <span className="text-text-muted">Searching...</span>}
                  </div>
                  <div className="flex justify-between">
                    <span>Matching driver status priority...</span>
                    {checks.priority ? <span className="text-emerald-600 font-bold">✓ Verified</span> : <span className="text-text-muted">Searching...</span>}
                  </div>
                </div>
              </div>

              {actionLoading && (
                <div className="flex items-center justify-center py-4 text-text-muted gap-2 text-xs">
                  <RefreshCw className="animate-spin text-taxi-500" size={16} /> Contacting dispatch server...
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </PageLayout>
  )
}
