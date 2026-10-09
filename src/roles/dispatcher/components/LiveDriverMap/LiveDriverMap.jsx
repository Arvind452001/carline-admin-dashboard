import { useState, useEffect, useRef } from 'react'
import { MapPin, RefreshCw, Search, Car, User, Phone, Radio, Filter, Wifi } from 'lucide-react'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyChjFXyiis_jicX6u-zKHVxqqMY0GtLPKc'

let scriptPromise = null
function loadGoogleMaps() {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps)
  }
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-sdk-livemap')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps))
      existing.addEventListener('error', (e) => reject(e))
      return
    }
    const script = document.createElement('script')
    script.id = 'google-maps-sdk-livemap'
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

function getCarMarkerIcon(status, maps) {
  let fillColor = '#10B981'; // Green = Available
  if (status === 'ON_TRIP') fillColor = '#F59E0B'; // Yellow/Orange = On Trip
  if (status === 'OFFLINE') fillColor = '#6B7280'; // Gray = Offline

  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="${fillColor}" opacity="0.25"/>
      <circle cx="20" cy="20" r="14" fill="${fillColor}" stroke="#ffffff" stroke-width="2.5"/>
      <g transform="translate(10, 10) scale(0.83)">
        <path fill="#ffffff" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4h14v4z"/>
        <circle fill="#ffffff" cx="7.5" cy="14.5" r="1.5"/>
        <circle fill="#ffffff" cx="16.5" cy="14.5" r="1.5"/>
      </g>
    </svg>
  `;

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgStr),
    scaledSize: new maps.Size(42, 42),
    anchor: new maps.Point(21, 21)
  };
}

// Smooth Rapido/Uber-style marker gliding animation
function animateMarkerTo(marker, newLat, newLng, duration = 1500) {
  if (!marker || !marker.getPosition) return
  const startPos = marker.getPosition()
  const startLat = startPos.lat()
  const startLng = startPos.lng()

  if (Math.abs(startLat - newLat) < 0.00001 && Math.abs(startLng - newLng) < 0.00001) {
    return
  }

  const startTime = performance.now()

  function animate(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const currentLat = startLat + (newLat - startLat) * progress
    const currentLng = startLng + (newLng - startLng) * progress

    marker.setPosition({ lat: currentLat, lng: currentLng })

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

export default function LiveDriverMap({ height = 520 }) {
  const token = useAuthStore((s) => s.token)
  const mapRef = useRef(null)
  const googleMapInstance = useRef(null)
  const markersRef = useRef({})
  const activeInfoWindowRef = useRef(null)
  const socketRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [companyId, setCompanyId] = useState(null)

  const [drivers, setDrivers] = useState([])
  const [summary, setSummary] = useState({
    totalDrivers: 0,
    availableDrivers: 0,
    onTripDrivers: 0,
    offlineDrivers: 0,
    activeTripsCount: 0
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Fetch Live Map Data from Backend
  const fetchLiveMapData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true)
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${baseUrl}/company/customers/live-map`, { headers })
      const json = await res.json()

      if (res.ok && json?.success && json?.data) {
        setDrivers(json.data.drivers || [])
        if (json.data.summary) setSummary(json.data.summary)
        if (json.data.company?.id) setCompanyId(json.data.company.id)
      }
    } catch (err) {
      console.warn('Failed to load live map data:', err)
    } finally {
      setLoading(false)
      if (isManual) setRefreshing(false)
    }
  }

  // Poll live map data every 15 seconds
  useEffect(() => {
    fetchLiveMapData()
    const interval = setInterval(() => {
      fetchLiveMapData()
    }, 15000)
    return () => clearInterval(interval)
  }, [token])

  // Real-time WebSockets Listener for Live Rapido/Uber Style Driver Marker Movement
  useEffect(() => {
    if (!token) return

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
    const socketUrl = baseUrl.replace(/\/api\/v1\/?$/, '')

    const socket = io(socketUrl, {
      path: '/viamo/socket.io',
      auth: { token },
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setSocketConnected(true)
      if (companyId) {
        socket.emit('joinCompanyRoom', { companyId })
      }
    })

    socket.on('disconnect', () => {
      setSocketConnected(false)
    })

    socket.on('driver:locationUpdate', (data) => {
      if (!data || !data.driverId) return
      const { driverId, latitude, longitude } = data

      // 1. Update driver state
      setDrivers((prevDrivers) =>
        prevDrivers.map((d) => {
          if (d.id === driverId || d.userId === driverId) {
            return {
              ...d,
              latitude: Number(latitude),
              longitude: Number(longitude),
              lastLocationAt: new Date().toISOString()
            }
          }
          return d
        })
      )

      // 2. Smoothly animate marker gliding on Google Map
      const targetMarker = markersRef.current[driverId]
      if (targetMarker && window.google) {
        animateMarkerTo(targetMarker, Number(latitude), Number(longitude), 1500)
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [token, companyId])

  // Initialize Google Map Canvas
  useEffect(() => {
    loadGoogleMaps()
      .then((maps) => {
        if (!mapRef.current || googleMapInstance.current) return

        const defaultCenter = { lat: 22.7196, lng: 75.8577 }
        const map = new maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        googleMapInstance.current = map
        setMapLoaded(true)
      })
      .catch((err) => {
        console.warn('Could not initialize Google Map canvas:', err)
      })
  }, [])

  // Render & Sync Markers on Map
  useEffect(() => {
    if (!mapLoaded || !googleMapInstance.current || !window.google) return
    const maps = window.google.maps
    const map = googleMapInstance.current

    const filteredDrivers = drivers.filter((driver) => {
      const matchesSearch =
        !search.trim() ||
        driver.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        driver.phoneNumber.toLowerCase().includes(search.toLowerCase().trim()) ||
        driver.vehicleTypeName.toLowerCase().includes(search.toLowerCase().trim())

      const matchesStatus =
        statusFilter === 'All' || driver.status === statusFilter

      return matchesSearch && matchesStatus
    })

    const currentDriverIds = new Set(filteredDrivers.map((d) => d.id))
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentDriverIds.has(id)) {
        markersRef.current[id].setMap(null)
        delete markersRef.current[id]
      }
    })

    if (filteredDrivers.length === 0) return

    const bounds = new maps.LatLngBounds()
    let validCoordCount = 0

    filteredDrivers.forEach((driver) => {
      const lat = Number(driver.latitude) || 22.7196
      const lng = Number(driver.longitude) || 75.8577
      const pos = { lat, lng }

      if (lat !== 0 && lng !== 0) {
        bounds.extend(pos)
        validCoordCount++
      }

      let pinColor = '#10B981'
      let statusLabel = 'AVAILABLE'
      if (driver.status === 'ON_TRIP') {
        pinColor = '#F59E0B'
        statusLabel = 'ON TRIP'
      } else if (driver.status === 'OFFLINE') {
        pinColor = '#6B7280'
        statusLabel = 'OFFLINE'
      }

      const carIcon = getCarMarkerIcon(driver.status, maps)

      let marker = markersRef.current[driver.id]
      if (!marker) {
        marker = new maps.Marker({
          position: pos,
          map,
          title: driver.name,
          icon: carIcon
        })

        marker.addListener('click', () => {
          if (activeInfoWindowRef.current) activeInfoWindowRef.current.close()

          const contentString = `
            <div style="padding: 10px; font-family: sans-serif; min-width: 200px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <strong style="font-size: 14px; color: #1e293b;">${driver.name}</strong>
                <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 9999px; background-color: ${pinColor}20; color: ${pinColor};">
                  ${statusLabel}
                </span>
              </div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">📞 ${driver.phoneNumber || 'N/A'}</div>
              <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">🚗 ${driver.vehicleTypeName}</div>
              <div style="font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 6px;">
                Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}
              </div>
            </div>
          `

          const infoWindow = new maps.InfoWindow({ content: contentString })
          infoWindow.open(map, marker)
          activeInfoWindowRef.current = infoWindow
        })

        markersRef.current[driver.id] = marker
      } else {
        // Smooth Rapido-style gliding transition on location update
        animateMarkerTo(marker, lat, lng, 1500)
        marker.setIcon(carIcon)
      }
    })

    if (validCoordCount > 0 && mapLoaded) {
      map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 })
      if (validCoordCount === 1) {
        map.setZoom(14)
      }
    }
  }, [drivers, search, statusFilter, mapLoaded])

  return (
    <div className="space-y-4">
      
      {/* Top Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-text-muted font-medium">Total Drivers</div>
            <div className="text-lg font-bold text-text-primary">{summary.totalDrivers}</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] text-text-muted font-medium">Available (Online)</div>
            <div className="text-lg font-bold text-emerald-500">{summary.availableDrivers}</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-text-muted font-medium">On Trip (Busy)</div>
            <div className="text-lg font-bold text-amber-500">{summary.onTripDrivers}</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-500/10 text-slate-400 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 opacity-60" />
          </div>
          <div>
            <div className="text-[11px] text-text-muted font-medium">Offline</div>
            <div className="text-lg font-bold text-text-secondary">{summary.offlineDrivers}</div>
          </div>
        </div>

        <div className="glass-card p-3 rounded-xl flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-9 h-9 rounded-lg bg-taxi-500/10 text-taxi-500 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-text-muted font-medium">Active Rides</div>
            <div className="text-lg font-bold text-taxi-500">{summary.activeTripsCount}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Status Filter & Refresh */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-subtle/40 p-3 rounded-xl border border-border-subtle">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search driver by name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border-subtle rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-taxi-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {socketConnected && (
            <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <Wifi className="w-3 h-3 animate-pulse" /> Live Socket Sync
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-surface border border-border-subtle px-2 py-1 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="All">All Drivers</option>
              <option value="AVAILABLE">Available (Online)</option>
              <option value="ON_TRIP">On Trip (Busy)</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          <button
            onClick={() => fetchLiveMapData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-taxi-500 hover:bg-taxi-600 text-taxi-black font-semibold text-xs rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Google Map Container */}
      <div className="relative rounded-2xl border border-border-subtle overflow-hidden shadow-sm" style={{ height }}>
        <div ref={mapRef} className="w-full h-full bg-surface-subtle" />

        {loading && (
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary bg-surface p-3 rounded-xl border border-border-subtle shadow-md">
              <RefreshCw className="w-4 h-4 animate-spin text-taxi-500" />
              Loading live map & driver locations...
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
