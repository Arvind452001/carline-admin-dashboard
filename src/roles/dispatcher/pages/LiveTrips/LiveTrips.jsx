import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Navigation,
  User,
  Car,
  Clock,
  RefreshCw,
  Phone,
  Mail,
  AlertCircle,
  Search,
  ExternalLink,
  Calendar,
  Star,
  Building,
  CreditCard,
  Eye,
  Route,
  Receipt
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'
import TripQuickModal from '@/roles/dispatcher/components/TripQuickModal'
import { useAuthStore } from '@/store/authStore'

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyChjFXyiis_jicX6u-zKHVxqqMY0GtLPKc'

let scriptPromise = null
function loadGoogleMaps() {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps)
  }
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-sdk-livetrips')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps))
      existing.addEventListener('error', (e) => reject(e))
      return
    }
    const script = document.createElement('script')
    script.id = 'google-maps-sdk-livetrips'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google && window.google.maps) resolve(window.google.maps)
      else reject(new Error('Google Maps SDK load failed'))
    }
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })
  return scriptPromise
}

function getUberCarIcon(maps) {
  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
      <circle cx="23" cy="23" r="21" fill="#F59E0B" opacity="0.25"/>
      <circle cx="23" cy="23" r="16" fill="#F59E0B" stroke="#ffffff" stroke-width="2.5"/>
      <g transform="translate(12, 12) scale(0.9)">
        <path fill="#ffffff" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4h14v4z"/>
        <circle fill="#ffffff" cx="7.5" cy="14.5" r="1.5"/>
        <circle fill="#ffffff" cx="16.5" cy="14.5" r="1.5"/>
      </g>
    </svg>
  `
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgStr),
    scaledSize: new maps.Size(46, 46),
    anchor: new maps.Point(23, 23)
  }
}

function getUberPickupIcon(maps) {
  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
      <circle cx="19" cy="19" r="17" fill="#10B981" opacity="0.25"/>
      <circle cx="19" cy="19" r="12" fill="#10B981" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="19" cy="19" r="4.5" fill="#ffffff"/>
    </svg>
  `
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgStr),
    scaledSize: new maps.Size(38, 38),
    anchor: new maps.Point(19, 19)
  }
}

function getUberDropoffIcon(maps) {
  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
      <circle cx="19" cy="19" r="17" fill="#EF4444" opacity="0.25"/>
      <rect x="10" y="10" width="18" height="18" rx="4" fill="#EF4444" stroke="#ffffff" stroke-width="2.5"/>
      <rect x="16" y="16" width="6" height="6" fill="#ffffff"/>
    </svg>
  `
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgStr),
    scaledSize: new maps.Size(38, 38),
    anchor: new maps.Point(19, 19)
  }
}

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

function getStatusBadgeClass(status) {
  const s = String(status || '').toUpperCase()
  if (s.includes('DISPATCH') || s.includes('DRIVER_ASSIGNED')) {
    return 'bg-blue-500/15 text-blue-500 border-blue-500/30'
  }
  if (s.includes('PROGRESS') || s.includes('STARTED') || s.includes('ONGOING')) {
    return 'bg-purple-500/15 text-purple-500 border-purple-500/30'
  }
  if (s.includes('SEARCH')) {
    return 'bg-amber-500/15 text-amber-500 border-amber-500/30'
  }
  if (s.includes('SCHEDULE')) {
    return 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30'
  }
  return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
}

export default function LiveTrips() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const [activeTrips, setActiveTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Detailed Modal State
  const [detailsModalTrip, setDetailsModalTrip] = useState(null)

  const mapContainerRef = useRef(null)
  const googleMapRef = useRef(null)
  const markersRef = useRef([])
  const polylineRef = useRef(null)

  const fetchActiveTrips = async () => {
    try {
      setLoading(true)
      setErrorMsg('')
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${baseUrl}/company/trips/active`, { headers })
      const json = await res.json()

      if (json?.status === 200 || json?.statusCode === 200 || json?.success || json?.data?.trips) {
        const trips = json?.data?.trips || (Array.isArray(json?.data) ? json.data : [])
        setActiveTrips(trips)
        if (trips.length > 0) {
          setSelectedTrip((prev) => {
            if (!prev) return trips[0]
            const match = trips.find((t) => t.id === prev.id)
            return match || trips[0]
          })
        } else {
          setSelectedTrip(null)
        }
      } else {
        setErrorMsg(json?.message || 'Failed to fetch active trips')
      }
    } catch (err) {
      console.error('Error fetching active trips:', err)
      setErrorMsg('Failed to connect to backend server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveTrips()
    const interval = setInterval(fetchActiveTrips, 15000)
    return () => clearInterval(interval)
  }, [token])

  // Filtered trips list
  const filteredTrips = useMemo(() => {
    return activeTrips.filter((trip) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        trip.tripId?.toLowerCase().includes(q) ||
        trip.id?.toLowerCase().includes(q) ||
        trip.customer?.name?.toLowerCase().includes(q) ||
        trip.customer?.phone?.toLowerCase().includes(q) ||
        trip.driver?.name?.toLowerCase().includes(q) ||
        trip.pickup?.address?.toLowerCase().includes(q) ||
        trip.dropoff?.address?.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (statusFilter === 'ALL') return true
      const s = String(trip.status || trip.rawStatus || '').toUpperCase()
      if (statusFilter === 'DISPATCHED') return s.includes('DISPATCH') || s.includes('DRIVER_ASSIGNED')
      if (statusFilter === 'SEARCHING') return s.includes('SEARCH')
      if (statusFilter === 'IN_PROGRESS') return s.includes('PROGRESS') || s.includes('STARTED')
      if (statusFilter === 'SCHEDULED') return s.includes('SCHEDULE')
      return true
    })
  }, [activeTrips, searchQuery, statusFilter])

  // Google Map updater
  useEffect(() => {
    if (!selectedTrip || !mapContainerRef.current) return

    loadGoogleMaps()
      .then((maps) => {
        const pickupLat = Number(selectedTrip.pickup?.latitude) || 22.7533
        const pickupLng = Number(selectedTrip.pickup?.longitude) || 75.8937
        const dropLat = Number(selectedTrip.dropoff?.latitude) || 22.7217
        const dropLng = Number(selectedTrip.dropoff?.longitude) || 75.8011

        if (!googleMapRef.current) {
          googleMapRef.current = new maps.Map(mapContainerRef.current, {
            center: { lat: pickupLat, lng: pickupLng },
            zoom: 13,
            disableDefaultUI: false,
            zoomControl: true,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#1f2937' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#374151' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#111827' }] },
            ]
          })
        }

        markersRef.current.forEach((m) => m.setMap(null))
        markersRef.current = []
        if (polylineRef.current) polylineRef.current.setMap(null)

        const bounds = new maps.LatLngBounds()

        // 1. Pickup Marker
        const pickupPos = { lat: pickupLat, lng: pickupLng }
        const pickupMarker = new maps.Marker({
          position: pickupPos,
          map: googleMapRef.current,
          title: `Pickup: ${selectedTrip.pickup?.address || 'Pickup Point'}`,
          icon: getUberPickupIcon(maps)
        })
        markersRef.current.push(pickupMarker)
        bounds.extend(pickupPos)

        // 2. Dropoff Marker
        const dropPos = { lat: dropLat, lng: dropLng }
        const dropMarker = new maps.Marker({
          position: dropPos,
          map: googleMapRef.current,
          title: `Dropoff: ${selectedTrip.dropoff?.address || 'Dropoff Point'}`,
          icon: getUberDropoffIcon(maps)
        })
        markersRef.current.push(dropMarker)
        bounds.extend(dropPos)

        // 3. Driver Marker
        const driverLat = (pickupLat + dropLat) / 2
        const driverLng = (pickupLng + dropLng) / 2
        const driverPos = { lat: driverLat, lng: driverLng }

        const driverMarker = new maps.Marker({
          position: driverPos,
          map: googleMapRef.current,
          title: `Driver: ${selectedTrip.driver?.name || 'Driver'}`,
          icon: getUberCarIcon(maps)
        })
        markersRef.current.push(driverMarker)

        // 4. Polyline Route
        polylineRef.current = new maps.Polyline({
          path: [pickupPos, driverPos, dropPos],
          geodesic: true,
          strokeColor: '#F59E0B',
          strokeOpacity: 0.85,
          strokeWeight: 5,
          map: googleMapRef.current
        })

        googleMapRef.current.fitBounds(bounds)
      })
      .catch((err) => console.warn('Google maps load error in LiveTrips:', err))
  }, [selectedTrip])

  return (
    <PageLayout
      title="Live Trips"
      description="Monitor active and ongoing trips, driver locations, and booking status in real time."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={fetchActiveTrips} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      }
    >
      {/* Search & Status Filters Bar */}
      <div className="glass-card rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by Trip ID, Customer, Driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-surface border border-border-subtle pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-taxi-500 focus:outline-none"
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none text-xs">
            {[
              { id: 'ALL', label: `All (${activeTrips.length})` },
              { id: 'DISPATCHED', label: 'Dispatched' },
              { id: 'IN_PROGRESS', label: 'In Progress' },
              { id: 'SEARCHING', label: 'Searching Driver' },
              { id: 'SCHEDULED', label: 'Scheduled' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  statusFilter === f.id
                    ? 'bg-taxi-500 text-black shadow-sm'
                    : 'bg-surface text-text-secondary hover:text-text-primary border border-border-subtle'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Active Trips Queue */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border-subtle pb-2">
            <h3 className="text-sm font-bold text-text-primary">
              Active Trips Queue ({filteredTrips.length})
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold">
              Live Fleet
            </span>
          </div>

          {loading && activeTrips.length === 0 ? (
            <div className="py-16 text-center text-xs text-text-muted">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-taxi-500" />
              Loading active company trips...
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="py-16 text-center text-xs text-text-muted space-y-1">
              <p className="font-semibold text-text-secondary">No active trips matching criteria.</p>
              <p className="text-[11px]">New bookings will automatically appear here.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredTrips.map((trip) => {
                const isSelected = selectedTrip?.id === trip.id
                const fareAmt = trip.fare?.displayFare
                  ? String(trip.fare.displayFare).replace(/₹/g, '$')
                  : `$${trip.fare?.amount || 0}`

                return (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-taxi-500/10 border-taxi-500 shadow-md ring-1 ring-taxi-500/30'
                        : 'bg-surface border-border-subtle hover:bg-surface-hover hover:border-border-strong'
                    }`}
                  >
                    {/* Header: ID, Status, Fare */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-text-primary">{trip.tripId}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${getStatusBadgeClass(trip.status || trip.rawStatus)}`}>
                            {trip.status || trip.rawStatus || 'Active'}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {trip.createdAt ? formatDate(trip.createdAt) : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-taxi-500 block">{fareAmt}</span>
                        <span className="text-[10px] text-text-muted uppercase font-mono">
                          {trip.fare?.paymentMethod || 'CASH'}
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-start gap-2 text-text-secondary">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        <span className="line-clamp-1">{trip.pickup?.address || 'Pickup Point'}</span>
                      </div>
                      <div className="flex items-start gap-2 text-text-secondary">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                        <span className="line-clamp-1">{trip.dropoff?.address || 'Destination'}</span>
                      </div>
                    </div>

                    {/* People & Metrics */}
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-border-subtle/50 text-[11px]">
                      <div className="flex items-center gap-1.5 text-text-secondary truncate max-w-[150px]">
                        <User size={12} className="text-taxi-500 shrink-0" />
                        <span className="truncate">{trip.customer?.name || 'Customer'}</span>
                      </div>

                      <div className="flex items-center gap-1 text-text-muted">
                        <Car size={12} className="text-emerald-500 shrink-0" />
                        <span className="truncate max-w-[120px] font-medium text-text-primary">
                          {trip.driver?.name || 'Searching...'}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex gap-2 mt-3 pt-2 border-t border-border-subtle/40">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTrip(trip)
                          setDetailsModalTrip(trip)
                        }}
                        className="flex-1 text-center py-1 rounded-lg bg-surface border border-border-subtle text-[11px] font-semibold text-text-primary hover:bg-taxi-500 hover:text-black transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye size={12} /> Quick Details
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/dispatcher/trip-details?tripId=${trip.id}`)
                        }}
                        className="px-2.5 py-1 rounded-lg bg-surface border border-border-subtle text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:border-taxi-500 transition-colors flex items-center gap-1"
                        title="Open Full Page Details"
                      >
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Live Map & Selected Trip Inspector */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Google Map Card */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <Navigation size={16} className="text-taxi-500 animate-pulse" />
                <h3 className="text-sm font-bold text-text-primary">Live Route & Driver Tracking</h3>
              </div>

              {selectedTrip && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">
                    Tracking <strong>{selectedTrip.tripId}</strong>
                  </span>
                  <button
                    onClick={() => setDetailsModalTrip(selectedTrip)}
                    className="text-xs text-taxi-500 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Details <ExternalLink size={11} />
                  </button>
                </div>
              )}
            </div>

            <div className="relative w-full h-[380px] rounded-xl bg-slate-900 border border-border-strong overflow-hidden">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Floating Tracking Card Overlay */}
              {selectedTrip && (
                <div className="absolute bottom-4 left-4 right-4 md:right-auto bg-slate-900/95 backdrop-blur-md px-4.5 py-3.5 rounded-2xl border border-slate-700/80 text-xs shadow-2xl space-y-2 min-w-[290px] max-w-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400" />
                      <span className="font-mono font-bold text-white text-sm tracking-tight">{selectedTrip.tripId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {selectedTrip.status || selectedTrip.rawStatus || 'SCHEDULED'}
                      </span>
                    </div>
                    <span className="text-emerald-400 font-black text-base tracking-tight">
                      ${selectedTrip.fare?.amount || selectedTrip.fare?.displayFare || 0}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center justify-between pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-medium">Driver:</span>
                      <strong className="text-white font-semibold">{selectedTrip.driver?.name || 'Searching...'}</strong>
                    </span>
                    {selectedTrip.driver?.vehicleRegistrationNumber && (
                      <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        {selectedTrip.driver.vehicleRegistrationNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3.5 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800">
                    <span>Distance: <strong className="text-white font-semibold">{selectedTrip.distanceKm || '—'} km</strong></span>
                    <span>Duration: <strong className="text-white font-semibold">{selectedTrip.durationMinutes || '—'} mins</strong></span>
                    <span>ETA: <strong className="text-emerald-400 font-bold">~{selectedTrip.etaMinutes || selectedTrip.durationMinutes || 0} mins</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Trip Comprehensive Inspector */}
          {selectedTrip && (
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    Trip Overview: {selectedTrip.tripId}
                  </h3>
                  <p className="text-[11px] text-text-muted">ID: {selectedTrip.id}</p>
                </div>

                <Button
                  size="xs"
                  icon={ExternalLink}
                  onClick={() => navigate(`/dispatcher/trip-details?tripId=${selectedTrip.id}`)}
                >
                  View Full Details
                </Button>
              </div>

              {/* 4-Column Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                
                {/* Customer */}
                <div className="bg-surface p-3.5 rounded-xl border border-border-subtle space-y-1">
                  <span className="text-text-muted flex items-center gap-1">
                    <User size={13} className="text-taxi-500" /> Customer
                  </span>
                  <p className="font-bold text-text-primary truncate">{selectedTrip.customer?.name || 'Customer'}</p>
                  <p className="text-[11px] text-text-secondary flex items-center gap-1">
                    <Phone size={10} /> {selectedTrip.customer?.phone || 'N/A'}
                  </p>
                </div>

                {/* Driver */}
                <div className="bg-surface p-3.5 rounded-xl border border-border-subtle space-y-1">
                  <span className="text-text-muted flex items-center gap-1">
                    <Car size={13} className="text-emerald-500" /> Driver
                  </span>
                  <p className="font-bold text-text-primary truncate">
                    {selectedTrip.driver?.name || 'No Driver Assigned'}
                  </p>
                  <p className="text-[11px] text-text-secondary truncate">
                    {selectedTrip.driver?.vehicleType || 'Standard'} {selectedTrip.driver?.vehicleRegistrationNumber ? `• ${selectedTrip.driver.vehicleRegistrationNumber}` : ''}
                  </p>
                </div>

                {/* Distance & ETA */}
                <div className="bg-surface p-3.5 rounded-xl border border-border-subtle space-y-1">
                  <span className="text-text-muted flex items-center gap-1">
                    <Clock size={13} className="text-purple-500" /> Metrics
                  </span>
                  <p className="font-bold text-text-primary">
                    {selectedTrip.distanceKm || '0'} km • {selectedTrip.durationMinutes || '0'} min
                  </p>
                  <p className="text-[11px] text-emerald-500 font-semibold">
                    ETA: ~{selectedTrip.etaMinutes || selectedTrip.durationMinutes || '—'} mins
                  </p>
                </div>

                {/* Fare & Method */}
                <div className="bg-surface p-3.5 rounded-xl border border-border-subtle space-y-1">
                  <span className="text-text-muted flex items-center gap-1">
                    <Receipt size={13} className="text-taxi-500" /> Fare & Method
                  </span>
                  <p className="font-bold text-taxi-500 text-sm">
                    {selectedTrip.fare?.displayFare || `$${selectedTrip.fare?.amount || 0}`}
                  </p>
                  <p className="text-[10px] text-text-muted uppercase">
                    {selectedTrip.fare?.paymentMethod || 'CASH'} • {selectedTrip.fare?.paymentStatus || 'PENDING'}
                  </p>
                </div>

              </div>

              {/* Pickup & Dropoff Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-surface p-3 rounded-xl border border-border-subtle flex items-start gap-2.5">
                  <MapPin size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-600">Pickup</span>
                    <p className="text-text-primary font-medium mt-0.5 line-clamp-2">
                      {selectedTrip.pickup?.address || 'Pickup Point'}
                    </p>
                  </div>
                </div>

                <div className="bg-surface p-3 rounded-xl border border-border-subtle flex items-start gap-2.5">
                  <Navigation size={15} className="text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-rose-500">Destination</span>
                    <p className="text-text-primary font-medium mt-0.5 line-clamp-2">
                      {selectedTrip.dropoff?.address || 'Dropoff Destination'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* FULL DETAILS MODAL */}
      <TripQuickModal
        trip={detailsModalTrip}
        open={!!detailsModalTrip}
        onClose={() => setDetailsModalTrip(null)}
      />

    </PageLayout>
  )
}
