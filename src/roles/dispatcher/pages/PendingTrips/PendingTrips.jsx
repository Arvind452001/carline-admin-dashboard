import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, Clock, Car, Sparkles, UserCheck, XCircle, 
  RefreshCw, CheckCircle2, AlertCircle, Phone, Mail, MapPin, Navigation, User, X,
  ExternalLink, Eye, Route, Receipt, Calendar, Building, Star
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Table from '@/shared/components/Table'
import Pagination from '@/shared/components/Pagination'
import Modal from '@/shared/components/Modal'
import Button from '@/shared/components/Button'
import TripQuickModal from '@/roles/dispatcher/components/TripQuickModal'
import { usePagination } from '@/shared/hooks/usePagination'
import { useAuthStore } from '@/store/authStore'

function formatDate(isoStr) {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return String(isoStr)
  }
}

export default function PendingTrips() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const [trips, setTrips] = useState([])
  const [drivers, setDrivers] = useState([])
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [vehicleFilter, setVehicleFilter] = useState('all')

  // Modals state
  const [assignModalTrip, setAssignModalTrip] = useState(null)
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [cancelModalTrip, setCancelModalTrip] = useState(null)
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation')
  const [detailsModalTrip, setDetailsModalTrip] = useState(null)

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'

  // Fetch Vehicle Types dynamically from API
  const fetchVehicleTypes = async () => {
    try {
      const res = await fetch(`${baseUrl}/driver/vehicle-types/all`)
      const json = await res.json()
      const list = json?.data || []
      if (Array.isArray(list) && list.length > 0) {
        setVehicleTypes(list)
      }
    } catch (err) {
      console.warn('Could not load vehicle types from API:', err)
    }
  }

  const fetchPendingTrips = async () => {
    try {
      setLoading(true)
      setErrorMsg('')
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      // Fetch pending trips & live map for drivers
      let tripsRes = await fetch(`${baseUrl}/company/trips?status=Pending&limit=50`, { headers })
      if (!tripsRes.ok) {
        tripsRes = await fetch(`${baseUrl}/dispatcher/pending-trips`, { headers })
      }

      const mapRes = await fetch(`${baseUrl}/company/trips/live-map`, { headers })

      const tripsJson = await tripsRes.json()
      const mapJson = await mapRes.json()

      if (tripsJson?.status === 200 || tripsJson?.statusCode === 200 || tripsJson?.data?.trips || tripsJson?.success) {
        const rawTrips = tripsJson?.data?.trips || (Array.isArray(tripsJson?.data) ? tripsJson.data : [])
        
        const formatted = rawTrips.map((t) => {
          // Robust ID extraction
          const rawId = t._id || t.id
          const tripCode = t.tripId || (typeof t.id === 'string' && t.id.startsWith('TRP-') ? t.id : `TRP-${String(rawId).slice(-4).toUpperCase()}`)

          // Customer parsing (handles string or object or customerDetails)
          const custName = 
            (typeof t.customer === 'string' ? t.customer : t.customer?.name) ||
            t.customerDetails?.name ||
            t.customerName ||
            'Customer'

          const custPhone = 
            t.customerDetails?.phone ||
            (typeof t.customer === 'object' ? t.customer?.phone : '') ||
            t.customerPhone ||
            ''

          const custEmail = 
            t.customerDetails?.email ||
            (typeof t.customer === 'object' ? t.customer?.email : '') ||
            ''

          // Driver parsing (handles string or object or driverDetails)
          const drvName = 
            (typeof t.driver === 'string' ? t.driver : t.driver?.name) ||
            t.driverDetails?.name ||
            t.driverName ||
            ''

          const drvPhone = 
            t.driverDetails?.phone ||
            (typeof t.driver === 'object' ? t.driver?.phone : '') ||
            ''

          const drvVehicle = 
            t.driverDetails?.vehicleType ||
            t.vehicle ||
            (typeof t.driver === 'object' ? t.driver?.vehicleType : '') ||
            t.vehicleTypeName ||
            'Standard'

          const drvPlate = 
            t.driverDetails?.plate ||
            (typeof t.driver === 'object' ? t.driver?.plate || t.driver?.vehicleRegistrationNumber : '') ||
            ''

          // Pickup parsing (handles string or object or pickupLocation)
          const pickupAddr = 
            (typeof t.pickup === 'string' ? t.pickup : t.pickup?.address) ||
            t.pickupAddress ||
            t.pickupLocation?.address ||
            'Pickup Location'

          const pickupLat = t.pickupLocation?.latitude ?? t.pickup?.latitude ?? 0
          const pickupLng = t.pickupLocation?.longitude ?? t.pickup?.longitude ?? 0

          // Dropoff parsing (handles string or object or dropoffLocation or dest)
          const dropoffAddr = 
            (typeof t.dropoff === 'string' ? t.dropoff : t.dropoff?.address) ||
            t.dest ||
            t.dropoffAddress ||
            t.dropoffLocation?.address ||
            'Destination'

          const dropoffLat = t.dropoffLocation?.latitude ?? t.dropoff?.latitude ?? 0
          const dropoffLng = t.dropoffLocation?.longitude ?? t.dropoff?.longitude ?? 0

          // Fare parsing (handles number, displayFare, or fareDetails)
          const fareDisplay = 
            t.displayFare ||
            t.fareDetails?.displayFare ||
            (typeof t.fare === 'string' ? t.fare : '') ||
            (typeof t.fare === 'number' ? `$${t.fare}` : t.fare?.displayFare || `$${t.fare?.amount || t.fareDetails?.amount || 0}`) ||
            '$0'

          const fareNum = typeof t.fare === 'number' ? t.fare : (t.fareDetails?.amount ?? t.fare?.amount ?? 0)

          // Time formatting
          const timeDisplay = 
            t.time ||
            t.scheduledFor ||
            (t.scheduledAt ? new Date(t.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '') ||
            (t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:30 AM')

          // Status & Priority
          const statusText = t.statusLabel || t.status || t.rawStatus || 'Pending'
          const distKm = Number(t.distanceKm || t.fareDetails?.breakdown?.distanceKm) || 0
          const priority = distKm > 20 ? 'High' : 'Normal'

          return {
            id: String(rawId),
            tripId: tripCode,
            customer: custName,
            customerPhone: custPhone,
            customerEmail: custEmail,
            customerDetails: t.customerDetails,
            driver: drvName,
            driverPhone: drvPhone,
            driverVehicle: drvVehicle,
            driverPlate: drvPlate,
            driverDetails: t.driverDetails,
            pickup: pickupAddr,
            pickupLat,
            pickupLng,
            dest: dropoffAddr,
            dropoffLat,
            dropoffLng,
            time: timeDisplay,
            scheduledAt: t.scheduledAt,
            createdAt: t.createdAt,
            priority,
            vehicle: drvVehicle,
            fare: fareDisplay,
            fareAmount: fareNum,
            fareDetails: t.fareDetails || t.fare,
            status: statusText,
            rawStatus: t.rawStatus,
            company: t.company,
            distanceKm: distKm,
            rawTrip: t
          }
        })
        setTrips(formatted)
      }

      if (mapJson?.status === 200 || mapJson?.statusCode === 200 || mapJson?.data?.drivers) {
        const rawDrivers = mapJson?.data?.drivers || mapJson?.data || []
        setDrivers(rawDrivers)
      }
    } catch (err) {
      console.error('Error fetching pending trips:', err)
      setErrorMsg('Failed to connect to backend server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicleTypes()
    fetchPendingTrips()
    const interval = setInterval(fetchPendingTrips, 15000)
    return () => clearInterval(interval)
  }, [token])

  // Auto select first driver when assign modal opens or drivers list updates
  useEffect(() => {
    if (assignModalTrip && drivers.length > 0 && !selectedDriverId) {
      const firstId = drivers[0].id || drivers[0]._id
      if (firstId) setSelectedDriverId(firstId)
    }
  }, [assignModalTrip, drivers, selectedDriverId])

  // Helper to open assign modal with fresh driver data
  const openAssignModal = async (trip) => {
    setAssignModalTrip(trip)
    if (drivers.length > 0) {
      setSelectedDriverId(drivers[0].id || drivers[0]._id || '')
    } else {
      setSelectedDriverId('')
      try {
        const headers = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        const mapRes = await fetch(`${baseUrl}/company/trips/live-map`, { headers })
        const mapJson = await mapRes.json()
        const rawDrivers = mapJson?.data?.drivers || mapJson?.data || []
        if (Array.isArray(rawDrivers) && rawDrivers.length > 0) {
          setDrivers(rawDrivers)
          setSelectedDriverId(rawDrivers[0].id || rawDrivers[0]._id || '')
        }
      } catch (err) {
        console.error('Error fetching drivers for modal:', err)
      }
    }
  }

  // Build dynamic vehicle type dropdown options from API
  const vehicleOptions = useMemo(() => {
    const defaultOptions = [{ value: 'all', label: 'All Vehicle Types' }]
    if (vehicleTypes.length > 0) {
      const dynamicOptions = vehicleTypes.map((vt) => ({
        value: vt.name,
        label: vt.name + (vt.seats ? ` (${vt.seats} Seats)` : '')
      }))
      return [...defaultOptions, ...dynamicOptions]
    }
    return [
      ...defaultOptions,
      { value: 'VIP Executive', label: 'VIP Executive (4 Seats)' },
      { value: 'Sedan Comfort', label: 'Sedan Comfort (4 Seats)' },
      { value: 'SUV 6-Seater', label: 'SUV 6-Seater (6 Seats)' },
      { value: 'Eco EV Green', label: 'Eco EV Green (4 Seats)' },
      { value: 'Van 8-Seater XL', label: 'Van 8-Seater XL (8 Seats)' }
    ]
  }, [vehicleTypes])

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchesSearch =
        t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.pickup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.dest.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tripId.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter
      const matchesVehicle = 
        vehicleFilter === 'all' || 
        t.vehicle.toLowerCase().includes(vehicleFilter.toLowerCase()) || 
        vehicleFilter.toLowerCase().includes(t.vehicle.toLowerCase())

      return matchesSearch && matchesPriority && matchesVehicle
    })
  }, [trips, searchQuery, priorityFilter, vehicleFilter])

  const { page, setPage, totalPages, pageItems } = usePagination(filteredTrips, 10)

  // Auto Assign Handler
  const handleAutoAssign = async (trip) => {
    try {
      setActionLoading(true)
      setErrorMsg('')
      setSuccessMsg('')

      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${baseUrl}/company/trips/${trip.id}/auto-assign`, {
        method: 'POST',
        headers
      })

      const json = await res.json()
      if (json?.status === 200 || json?.statusCode === 200 || json?.success) {
        setSuccessMsg(json?.message || `Auto-assigned driver to ${trip.tripId} successfully!`)
        fetchPendingTrips()
      } else {
        setErrorMsg(json?.message || 'Failed to auto-assign driver')
      }
    } catch (err) {
      console.error('Auto assign error:', err)
      setErrorMsg('Failed to process auto-assignment')
    } finally {
      setActionLoading(false)
    }
  }

  // Manual Assign Handler
  const handleManualAssign = async () => {
    if (!selectedDriverId || !assignModalTrip) return
    try {
      setActionLoading(true)
      setErrorMsg('')
      setSuccessMsg('')

      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${baseUrl}/company/trips/${assignModalTrip.id}/assign-driver`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ driverId: selectedDriverId })
      })

      const json = await res.json()
      if (json?.status === 200 || json?.statusCode === 200 || json?.success) {
        setSuccessMsg(json?.message || `Driver assigned to ${assignModalTrip.tripId} successfully!`)
        setAssignModalTrip(null)
        setSelectedDriverId('')
        fetchPendingTrips()
      } else {
        setErrorMsg(json?.message || 'Failed to assign driver')
      }
    } catch (err) {
      console.error('Manual assign error:', err)
      setErrorMsg('Failed to process driver assignment')
    } finally {
      setActionLoading(false)
    }
  }

  // Cancel Handler
  const handleCancelTrip = async () => {
    if (!cancelModalTrip) return
    try {
      setActionLoading(true)
      setErrorMsg('')
      setSuccessMsg('')

      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      let res = await fetch(`${baseUrl}/company/trips/${cancelModalTrip.id}/cancel`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ cancelReason })
      })

      if (!res.ok) {
        res = await fetch(`${baseUrl}/company/trips/${cancelModalTrip.id}`, {
          method: 'DELETE',
          headers
        })
      }

      const json = await res.json()
      if (json?.status === 200 || json?.statusCode === 200 || json?.success) {
        setSuccessMsg(`Trip ${cancelModalTrip.tripId} cancelled successfully.`)
        setCancelModalTrip(null)
        fetchPendingTrips()
      } else {
        setErrorMsg(json?.message || 'Failed to cancel trip')
      }
    } catch (err) {
      console.error('Cancel trip error:', err)
      setErrorMsg('Failed to process trip cancellation')
    } finally {
      setActionLoading(false)
    }
  }

  const columns = [
    { 
      key: 'tripId', 
      label: 'TRIP ID', 
      render: (r) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-text-primary text-xs">{r.tripId}</span>
          </div>
          <p className="text-[11px] text-taxi-500 font-bold">{r.fare}</p>
        </div>
      ) 
    },
    { 
      key: 'customer', 
      label: 'CUSTOMER', 
      render: (r) => (
        <div>
          <p className="font-semibold text-text-primary text-xs flex items-center gap-1">
            <User size={11} className="text-taxi-500 shrink-0" />
            <span className="truncate max-w-[130px]">{r.customer}</span>
          </p>
          {r.customerPhone && (
            <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
              <Phone size={9} /> {r.customerPhone}
            </p>
          )}
        </div>
      ) 
    },
    {
      key: 'driver',
      label: 'ASSIGNED DRIVER',
      render: (r) => (
        <div>
          {r.driver ? (
            <div>
              <p className="font-semibold text-text-primary text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate max-w-[120px]">{r.driver}</span>
              </p>
              <p className="text-[10px] text-text-muted truncate max-w-[120px]">
                {r.driverPlate ? `Plate: ${r.driverPlate}` : r.driverVehicle}
              </p>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unassigned
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'pickup', 
      label: 'ROUTE (PICKUP → DESTINATION)', 
      render: (r) => (
        <div className="text-xs space-y-1 max-w-[200px]">
          <div className="flex items-start gap-1.5 text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <span className="line-clamp-1" title={r.pickup}>{r.pickup}</span>
          </div>
          <div className="flex items-start gap-1.5 text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
            <span className="line-clamp-1" title={r.dest}>{r.dest}</span>
          </div>
        </div>
      ) 
    },
    { 
      key: 'time', 
      label: 'TIME / SCHEDULE', 
      render: (r) => (
        <div className="text-xs space-y-0.5">
          <span className="flex items-center gap-1 font-medium text-text-primary">
            <Clock size={11} className="text-text-muted" /> {r.time}
          </span>
          {r.scheduledAt && (
            <p className="text-[10px] text-text-muted">
              {formatDate(r.scheduledAt)}
            </p>
          )}
        </div>
      ) 
    },
    { 
      key: 'vehicle', 
      label: 'VEHICLE TYPE', 
      render: (r) => (
        <span className="flex items-center gap-1 text-xs text-text-primary font-medium">
          <Car size={13} className="text-taxi-500 shrink-0" /> {r.vehicle}
        </span>
      ) 
    },
    { 
      key: 'status', 
      label: 'STATUS', 
      render: (r) => (
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${
          String(r.status).toLowerCase().includes('sched')
            ? 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30'
            : String(r.status).toLowerCase().includes('search')
            ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
        }`}>
          {r.status}
        </span>
      ) 
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {/* Quick Details Modal Button */}
          <button
            onClick={() => setDetailsModalTrip(r)}
            className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border-strong text-text-secondary hover:text-text-primary transition-all"
            title="View full trip record"
          >
            <Eye size={13} />
          </button>

          {/* Dedicated Page Link */}
          <button
            onClick={() => navigate(`/dispatcher/trip-details?tripId=${r.id}`)}
            className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border-strong text-text-secondary hover:text-taxi-500 transition-all"
            title="Open Dedicated Trip Page"
          >
            <ExternalLink size={13} />
          </button>

          {/* Auto Assign Button */}
          <button
            onClick={() => handleAutoAssign(r)}
            disabled={actionLoading}
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
            title="Auto assign nearest available company driver"
          >
            <Sparkles size={12} />
            <span>Auto</span>
          </button>

          {/* Manual Assign Button */}
          <button
            onClick={() => openAssignModal(r)}
            disabled={actionLoading}
            className="px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border-strong text-text-primary text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
            title="Manually select company driver"
          >
            <UserCheck size={12} className="text-taxi-500" />
            <span>Assign</span>
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => setCancelModalTrip(r)}
            disabled={actionLoading}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 transition-all active:scale-95 disabled:opacity-50"
            title="Cancel this booking"
          >
            <XCircle size={14} />
          </button>
        </div>
      )
    }
  ]

  return (
    <PageLayout
      title="Pending Trips"
      description="Review rides awaiting dispatch, trigger auto driver matching, or manually assign drivers."
      actions={
        <Button variant="secondary" icon={RefreshCw} onClick={fetchPendingTrips} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      }
    >
      {/* Top Banner Notifications */}
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="hover:opacity-75"><X size={14} /></button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="hover:opacity-75"><X size={14} /></button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Total Pending Bookings</p>
            <h3 className="text-xl font-bold text-text-primary mt-1">{trips.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Assigned Drivers</p>
            <h3 className="text-xl font-bold text-emerald-500 mt-1">
              {trips.filter(t => t.driver).length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Active Fleet Drivers</p>
            <h3 className="text-xl font-bold text-blue-500 mt-1">
              {drivers.length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Car size={20} />
          </div>
        </div>
      </div>

      {/* Filtering Header Card */}
      <div className="flex flex-col md:flex-row md:items-end gap-3 glass-card p-4 rounded-2xl mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search pending trips by customer, location, or trip ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
            containerClassName="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            label="Priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'High', label: 'High Priority' },
              { value: 'Normal', label: 'Normal Priority' }
            ]}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            label="Vehicle Type"
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            options={vehicleOptions}
          />
        </div>
      </div>

      {/* Table & Pagination */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
        <Table borderless columns={columns} rows={pageItems} keyField="id" emptyLabel="No pending bookings awaiting dispatch" />
        <div className="p-4 border-t border-border-subtle">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* FULL RECORD DETAILS MODAL */}
      <TripQuickModal
        trip={detailsModalTrip}
        open={!!detailsModalTrip}
        onClose={() => setDetailsModalTrip(null)}
        onAssignDriver={(t) => {
          setDetailsModalTrip(null)
          setAssignModalTrip(t)
        }}
      />

      {/* Manual Assign Driver Modal */}
      {assignModalTrip && (
        <Modal open={true} isOpen={true} onClose={() => setAssignModalTrip(null)} title={`Assign Driver to ${assignModalTrip.tripId}`}>
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-surface rounded-xl border border-border-subtle space-y-1">
              <p className="font-bold text-text-primary">Trip Details:</p>
              <p className="text-text-secondary">Customer: <strong>{assignModalTrip.customer}</strong> • Vehicle: <strong>{assignModalTrip.vehicle}</strong></p>
              <p className="text-text-secondary">Route: {assignModalTrip.pickup} → {assignModalTrip.dest}</p>
              <p className="text-taxi-500 font-bold">Fare: {assignModalTrip.fare}</p>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">Select Company Driver:</label>
              {drivers.length === 0 ? (
                <p className="text-text-muted italic py-2">No company drivers loaded. Loading...</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {drivers.map((d) => {
                    const dId = d.id || d._id
                    const isSelected = selectedDriverId === dId
                    return (
                      <div
                        key={dId}
                        onClick={() => setSelectedDriverId(dId)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                          isSelected
                            ? 'bg-taxi-500/10 border-taxi-500'
                            : 'bg-surface border-border-subtle hover:bg-surface-hover'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-text-primary">{d.name || d.fullName}</p>
                          <p className="text-[10px] text-text-muted">{d.phone || d.phoneNumber || 'N/A'} • {d.vehicleType || 'Sedan'}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          d.status === 'ON_TRIP' || d.status === 'RIDING' || d.status === 'ONGOING' || d.status === 'BUSY'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : d.status === 'AVAILABLE' || d.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}>
                          {d.status === 'ON_TRIP' || d.status === 'RIDING' || d.status === 'ONGOING' ? 'ON RIDE' : (d.status || 'AVAILABLE')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
              <Button variant="secondary" onClick={() => setAssignModalTrip(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleManualAssign}
                disabled={!selectedDriverId || actionLoading}
              >
                {actionLoading ? 'Assigning...' : 'Assign Driver'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Booking Modal */}
      {cancelModalTrip && (
        <Modal open={true} isOpen={true} onClose={() => setCancelModalTrip(null)} title={`Cancel Booking ${cancelModalTrip.tripId}`}>
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Are you sure you want to cancel booking <strong>{cancelModalTrip.tripId}</strong> for <strong>{cancelModalTrip.customer}</strong>?
            </p>

            <div>
              <label className="block font-semibold text-text-primary mb-1">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface border border-border-strong text-text-primary text-xs focus:ring-2 focus:ring-taxi-500 outline-none"
              >
                <option value="Customer requested cancellation">Customer requested cancellation</option>
                <option value="No drivers available in area">No drivers available in area</option>
                <option value="Duplicate booking request">Duplicate booking request</option>
                <option value="Incorrect pickup location">Incorrect pickup location</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
              <Button variant="secondary" onClick={() => setCancelModalTrip(null)}>
                Keep Booking
              </Button>
              <Button variant="danger" onClick={handleCancelTrip} disabled={actionLoading}>
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
