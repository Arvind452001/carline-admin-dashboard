import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, User, Car, Coins, Clock, RefreshCw, Phone, AlertCircle } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
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

// Rapido/Uber Style Car Marker Icon
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
  `;
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgStr),
    scaledSize: new maps.Size(46, 46),
    anchor: new maps.Point(23, 23)
  }
}

// Rapido/Uber Style Pickup Green Marker Icon
function getUberPickupIcon(maps) {
  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
      <circle cx="19" cy="19" r="17" fill="#10B981" opacity="0.25"/>
      <circle cx="19" cy="19" r="12" fill="#10B981" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="19" cy="19" r="4.5" fill="#ffffff"/>
    </svg>
  `;
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgStr),
    scaledSize: new maps.Size(38, 38),
    anchor: new maps.Point(19, 19)
  }
}

// Rapido/Uber Style Dropoff Red Marker Icon
function getUberDropoffIcon(maps) {
  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38">
      <circle cx="19" cy="19" r="17" fill="#EF4444" opacity="0.25"/>
      <rect x="10" y="10" width="18" height="18" rx="4" fill="#EF4444" stroke="#ffffff" stroke-width="2.5"/>
      <rect x="16" y="16" width="6" height="6" fill="#ffffff"/>
    </svg>
  `;
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgStr),
    scaledSize: new maps.Size(38, 38),
    anchor: new maps.Point(19, 19)
  }
}

export default function LiveTrips() {
  const token = useAuthStore((s) => s.token)
  const [activeTrips, setActiveTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

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
        const trips = json?.data?.trips || json?.data || []
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

  // Initialize and update map whenever selectedTrip changes
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

        // Clear existing markers & polylines
        markersRef.current.forEach((m) => m.setMap(null))
        markersRef.current = []
        if (polylineRef.current) polylineRef.current.setMap(null)

        const bounds = new maps.LatLngBounds()

        // 1. Rapido/Uber Pickup Marker
        const pickupPos = { lat: pickupLat, lng: pickupLng }
        const pickupMarker = new maps.Marker({
          position: pickupPos,
          map: googleMapRef.current,
          title: `Pickup Location: ${selectedTrip.pickup?.address || 'Pickup Point'}`,
          icon: getUberPickupIcon(maps),
        })
        markersRef.current.push(pickupMarker)
        bounds.extend(pickupPos)

        // 2. Rapido/Uber Dropoff Marker
        const dropPos = { lat: dropLat, lng: dropLng }
        const dropMarker = new maps.Marker({
          position: dropPos,
          map: googleMapRef.current,
          title: `Drop-off Destination: ${selectedTrip.dropoff?.address || 'Dropoff Point'}`,
          icon: getUberDropoffIcon(maps),
        })
        markersRef.current.push(dropMarker)
        bounds.extend(dropPos)

        // 3. Rapido/Uber Car Driver Marker
        const driverLat = (pickupLat + dropLat) / 2
        const driverLng = (pickupLng + dropLng) / 2
        const driverPos = { lat: driverLat, lng: driverLng }

        const driverMarker = new maps.Marker({
          position: driverPos,
          map: googleMapRef.current,
          title: `Driver: ${selectedTrip.driver?.name || 'Driver'}`,
          icon: getUberCarIcon(maps),
        })
        markersRef.current.push(driverMarker)

        // 4. Polyline Route
        polylineRef.current = new maps.Polyline({
          path: [pickupPos, driverPos, dropPos],
          geodesic: true,
          strokeColor: '#F59E0B',
          strokeOpacity: 0.85,
          strokeWeight: 5,
          map: googleMapRef.current,
        })

        googleMapRef.current.fitBounds(bounds)
      })
      .catch((err) => console.warn('Google maps load error in LiveTrips:', err))
  }, [selectedTrip])

  return (
    <PageLayout
      title="Live Trips"
      description="Monitor active and ongoing trips, driver locations, and booking status in real time."
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-text-secondary">
            {activeTrips.length} Active {activeTrips.length === 1 ? 'Trip' : 'Trips'} Running
          </span>
        </div>
        <button
          onClick={fetchActiveTrips}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-surface border border-border-subtle hover:bg-surface-hover text-text-primary transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
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
            <h3 className="text-sm font-bold text-text-primary">Active Trips Queue</h3>
            <span className="text-[10px] bg-taxi-500/10 text-taxi-500 px-2 py-0.5 rounded font-bold">
              {activeTrips.length} Live
            </span>
          </div>

          {loading && activeTrips.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-taxi-500" />
              Loading active company trips...
            </div>
          ) : activeTrips.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">
              No active trips found. Creating one...
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {activeTrips.map((trip) => {
                const isSelected = selectedTrip?.id === trip.id
                return (
                  <div
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-taxi-500/10 border-taxi-500 shadow-sm'
                        : 'bg-surface border-border-subtle hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5 overflow-hidden">
                          <span className="shrink-0">{trip.tripId || trip.id}</span>
                          <span className="text-text-muted font-normal shrink-0">•</span>
                          <span className="text-xs text-text-secondary truncate max-w-[110px]">
                            {trip.driver?.name || 'Assigned Driver'}
                          </span>
                        </h4>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                          {trip.pickup?.address || 'Pickup'} → {trip.dropoff?.address || 'Dropoff'}
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold whitespace-nowrap shrink-0 max-w-[110px] truncate text-center">
                        {trip.status === 'SEARCHING_DRIVER' ? 'Searching Driver' : (trip.status ? String(trip.status).replace(/_/g, ' ') : '')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-border-subtle/50 text-[11px] text-text-muted">
                      <span>Customer: <strong className="text-text-primary">{trip.customer?.name}</strong></span>
                      <span>Fare: <strong className="text-taxi-500">{trip.fare?.displayFare ? String(trip.fare.displayFare).replace(/₹/g, "$") : `${trip.fare?.amount || 0}`}</strong></span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Map + Overlay Details */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border-subtle pb-2">
            <h3 className="text-sm font-bold text-text-primary">Real-time Location Map</h3>
            {selectedTrip && (
              <span className="text-xs text-text-secondary">
                Tracking <strong>{selectedTrip.tripId || selectedTrip.id}</strong>
              </span>
            )}
          </div>

          <div className="relative w-full h-[380px] rounded-xl bg-slate-900 border border-border-strong overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Map Indicators */}
            {selectedTrip && (
              <div className="absolute bottom-4 left-4 bg-ink/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-border-subtle text-[11px] text-text-secondary pointer-events-none shadow-lg">
                <p className="font-semibold text-text-primary flex items-center gap-1.5">
                  <Navigation size={13} className="text-taxi-500 animate-pulse" />
                  Tracking {selectedTrip.tripId || selectedTrip.id}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Driver: {selectedTrip.driver?.name || 'Assigned Driver'} • Vehicle: {selectedTrip.driver?.vehicleRegistrationNumber || selectedTrip.driver?.vehicleType || 'Standard'}
                </p>
              </div>
            )}
          </div>

          {/* Selected trip details summary */}
          {selectedTrip && (
            <div className="bg-surface p-4 rounded-xl border border-border-subtle grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-text-muted flex items-center gap-1"><User size={12} /> Driver</span>
                <p className="font-bold text-text-primary mt-1 truncate">{selectedTrip.driver?.name || 'Searching...'}</p>
                <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                  <Phone size={10} /> {selectedTrip.driver?.phone || 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-text-muted flex items-center gap-1"><User size={12} /> Customer</span>
                <p className="font-bold text-text-primary mt-1 truncate">{selectedTrip.customer?.name || 'Guest'}</p>
                <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                  <Phone size={10} /> {selectedTrip.customer?.phone || 'N/A'}
                </p>
              </div>

              <div>
                <span className="text-text-muted flex items-center gap-1"><Clock size={12} /> Distance & Duration</span>
                <p className="font-bold text-text-primary mt-1">{selectedTrip.distanceKm || 12} km ({selectedTrip.durationMinutes || 25} mins)</p>
                <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                  ETA ~{selectedTrip.etaMinutes || 8} min
                </p>
              </div>

              <div>
                <span className="text-text-muted flex items-center gap-1"><Coins size={12} /> Fare & Payment</span>
                <p className="font-bold text-taxi-500 mt-1">{selectedTrip.fare?.displayFare ? String(selectedTrip.fare.displayFare).replace(/₹/g, "$") : `${selectedTrip.fare?.amount || 0}`}</p>
                <p className="text-[10px] text-text-muted uppercase mt-0.5">
                  {selectedTrip.fare?.paymentMethod || 'CASH'} • {selectedTrip.fare?.paymentStatus || 'PENDING'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
