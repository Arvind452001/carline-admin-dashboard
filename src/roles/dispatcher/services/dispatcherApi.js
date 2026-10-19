import { apiClient, resolveUploadUrl } from '@/shared/services/apiClient'
import { setCurrencySymbol } from '@/shared/utils/formatting'
import { notificationService } from '@/shared/services/notificationService'

const str = (value) => (value === undefined || value === null ? '' : String(value))
const numOr = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}
const numOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const FRIENDLY_SLUGS = ['pending', 'dispatched', 'ongoing', 'scheduled', 'completed', 'cancelled', 'active', 'request_sent']

const RAW_STATUS_SLUGS = {
  SEARCHING_DRIVER: 'pending',
  SCHEDULED: 'scheduled',
  REQUEST_SENT: 'request_sent',
  DRIVER_ASSIGNED: 'dispatched',
  DRIVER_ARRIVED: 'dispatched',
  RIDE_STARTED: 'ongoing',
  RIDE_COMPLETED: 'completed',
  RIDE_CANCELLED: 'cancelled',
}

export function tripStatusSlug(raw) {
  const friendly = str(raw?.status).trim().toLowerCase()
  if (FRIENDLY_SLUGS.includes(friendly)) return friendly
  if (friendly === 'request_sent' || friendly === 'request sent') return 'request_sent'

  const code = str(raw?.rawStatus || raw?.status).trim().toUpperCase()
  if (RAW_STATUS_SLUGS[code]) return RAW_STATUS_SLUGS[code]
  if (code === 'REQUEST_SENT') return 'request_sent'
  return 'pending'
}

function captureFareCurrency(payload) {
  const symbol = payload?.fare?.currency ?? payload?.currency ?? payload?.currencySymbol
  if (typeof symbol !== 'string') return
  const trimmed = symbol.trim()
  if (!trimmed || /^[A-Za-z]{2,}$/.test(trimmed)) return
  setCurrencySymbol(trimmed)
}

function normalizePlace(place, fallbackObj = null) {
  if (typeof place === 'string' && place.trim()) {
    return {
      address: place.trim(),
      latitude: numOrNull(fallbackObj?.latitude),
      longitude: numOrNull(fallbackObj?.longitude),
    }
  }
  if (place && typeof place === 'object') {
    return {
      address: str(place.address || place.name || fallbackObj?.address || ''),
      latitude: numOrNull(place.latitude ?? place.lat ?? fallbackObj?.latitude),
      longitude: numOrNull(place.longitude ?? place.lng ?? fallbackObj?.longitude),
    }
  }
  if (fallbackObj && typeof fallbackObj === 'object') {
    return {
      address: str(fallbackObj.address || ''),
      latitude: numOrNull(fallbackObj.latitude ?? fallbackObj.lat),
      longitude: numOrNull(fallbackObj.longitude ?? fallbackObj.lng),
    }
  }
  return { address: '', latitude: null, longitude: null }
}

function normalizeFare(fare, fallbackObj = null, rootObj = {}) {
  const raw = (fare && typeof fare === 'object') ? fare : (fallbackObj && typeof fallbackObj === 'object' ? fallbackObj : {})
  const numAmt = typeof fare === 'number' ? fare : (raw.amount ?? raw.payableFare ?? raw.totalFare ?? rootObj.fare)
  return {
    amount: numOrNull(numAmt),
    displayFare: str(raw.displayFare || rootObj.displayFare || (numAmt != null ? `$${numAmt}` : '')),
    payableFare: numOrNull(raw.payableFare ?? numAmt),
    totalFare: numOrNull(raw.totalFare ?? numAmt),
    discount: numOrNull(raw.discount ?? raw.breakdown?.discount),
    promoCode: str(raw.promoCode || rootObj.promoCode),
    currency: str(raw.currency || rootObj.currency || '$'),
    paymentMethod: str(raw.paymentMethod || fallbackObj?.paymentMethod || rootObj.paymentMethod || 'WALLET'),
    paymentStatus: str(raw.paymentStatus || fallbackObj?.paymentStatus || rootObj.paymentStatus || 'PENDING').toLowerCase(),
    breakdown: raw.breakdown && typeof raw.breakdown === 'object' ? raw.breakdown : (fallbackObj?.breakdown && typeof fallbackObj.breakdown === 'object' ? fallbackObj.breakdown : null),
  }
}

function displayTripId(id, tripId) {
  return str(tripId) || (id ? `TRP-${String(id).slice(-4).toUpperCase()}` : 'TRP-0000')
}

export function normalizeTrip(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw._id ?? raw.id
  if (!id) return null

  const rideType = str(raw.rideType) || (raw.scheduledAt || raw.scheduledFor || raw.time ? 'SCHEDULED' : 'INSTANT')

  return {
    id: String(id),
    tripId: displayTripId(id, raw.tripId),
    customer: {
      id: str(raw.passenger?.id || raw.passenger?._id || raw.customerDetails?.id || (typeof raw.customer === 'object' ? raw.customer?.id || raw.customer?._id : '') || raw.customerId || raw.userId),
      name: str(
        raw.passenger?.name ||
        raw.passenger?.fullName ||
        (raw.passenger ? `${raw.passenger.firstName || ''} ${raw.passenger.lastName || ''}`.trim() : '') ||
        (typeof raw.customer === 'string' ? raw.customer : raw.customer?.name) ||
        raw.customerDetails?.name ||
        raw.customer?.fullName ||
        raw.customerName ||
        (raw.passengerFirstName ? `${raw.passengerFirstName} ${raw.passengerLastName || ''}`.trim() : '') ||
        raw.guestName
      ) || 'Customer',
      phone: str(
        raw.passenger?.phone ||
        raw.customerDetails?.phone ||
        (typeof raw.customer === 'object' ? raw.customer?.phone : '') ||
        raw.customerPhone ||
        raw.passengerPhone ||
        raw.guestPhone
      ),
      email: str(
        raw.passenger?.email ||
        raw.customerDetails?.email ||
        (typeof raw.customer === 'object' ? raw.customer?.email : '') ||
        raw.passengerEmail
      ),
      avatar: resolveUploadUrl(str(raw.passenger?.avatar || raw.customerDetails?.avatar || (typeof raw.customer === 'object' ? raw.customer?.avatar : ''))),
    },
    passenger: raw.passenger ? {
      id: str(raw.passenger.id || raw.passenger._id),
      name: str(raw.passenger.name || `${raw.passenger.firstName || ''} ${raw.passenger.lastName || ''}`.trim() || 'Passenger'),
      phone: str(raw.passenger.phone || raw.passenger.phoneNumber),
      email: str(raw.passenger.email),
      avatar: resolveUploadUrl(str(raw.passenger.avatar)),
    } : null,
    driver: (() => {
      const rawDriver = raw.driverDetails || raw.driver || raw.assignedDriver || (raw.driverId ? { id: raw.driverId, name: raw.driverName } : null)
      if (!rawDriver) return null
      if (typeof rawDriver === 'string') {
        return {
          id: str(raw.driverId),
          name: rawDriver || str(raw.driverName),
          phone: str(raw.driverPhone),
          email: '',
          vehicleType: str(raw.vehicle || raw.vehicleTypeName),
          plate: str(raw.plate || raw.driverPlate),
          make: '',
          modelAndYear: '',
          avatar: '',
          rating: null,
        }
      }
      return {
        id: str(rawDriver.id || rawDriver._id || rawDriver.driverId || raw.driverId),
        name: str(rawDriver.name || rawDriver.fullName || rawDriver.driverName || raw.driverName || (typeof raw.driver === 'string' ? raw.driver : '')),
        phone: str(rawDriver.phone || rawDriver.phoneNumber || rawDriver.driverPhone),
        email: str(rawDriver.email),
        vehicleType: str(rawDriver.vehicleType || raw.vehicle || raw.vehicleTypeName || rawDriver.vehicleTypeName),
        plate: str(rawDriver.plate || rawDriver.vehicleRegistrationNumber || raw.plate || raw.driverPlate),
        vehicleRegistrationNumber: str(rawDriver.vehicleRegistrationNumber || rawDriver.plate || raw.plate || raw.driverPlate),
        make: str(rawDriver.make),
        modelAndYear: str(rawDriver.modelAndYear),
        avatar: resolveUploadUrl(str(rawDriver.avatar)),
        rating: numOrNull(rawDriver.rating),
      }
    })(),
    company: (() => {
      if (!raw.company && !raw.companyName && !raw.companyCode) return null
      if (typeof raw.company === 'string') {
        return {
          id: str(raw.companyId),
          name: raw.company,
          code: str(raw.companyCode || 'CMP-003'),
          logo: '',
        }
      }
      return {
        id: str(raw.company?.id || raw.company?._id || raw.companyId),
        name: str(raw.company?.name || raw.companyName || 'ABC Taxi'),
        code: str(raw.company?.code || raw.companyCode || 'CMP-003'),
        logo: resolveUploadUrl(str(raw.company?.logo)),
      }
    })(),
    pickup: normalizePlace(raw.pickup, raw.pickupLocation || raw.pickupAddress),
    dropoff: normalizePlace(raw.dropoff || raw.dest || raw.dropoffAddress, raw.dropoffLocation),
    fare: normalizeFare(raw.fare, raw.fareDetails, raw),
    status: str(raw.statusLabel || raw.status || 'Pending'),
    statusSlug: tripStatusSlug(raw),
    rawStatus: str(raw.rawStatus || raw.status),
    rideType,
    vehicleType: str(raw.vehicle || raw.driverDetails?.vehicleType || raw.driver?.vehicleType || raw.vehicleTypeName || raw.vehicleType),
    distanceKm: numOr(raw.distanceKm || raw.fareDetails?.breakdown?.distanceKm),
    durationMinutes: numOr(raw.durationMinutes || raw.fareDetails?.breakdown?.durationMinutes),
    etaMinutes: numOr(raw.etaMinutes || raw.durationMinutes || raw.fareDetails?.breakdown?.durationMinutes),
    time: str(raw.time || raw.scheduledFor),
    scheduledAt: raw.scheduledAt || '',
    createdAt: raw.createdAt || raw.timeline?.createdAt || '',
    cancelReason: str(raw.cancelReason || raw.timeline?.cancelReason),
    cancelledBy: str(raw.cancelledBy || raw.timeline?.cancelledBy),
    timeline: raw.timeline || {},
    notes: str(raw.notes),
    stops: str(raw.stops),
    promoCode: str(raw.promoCode),
  }
}

export function normalizeTripListResponse(data) {
  const rows = Array.isArray(data?.trips)
    ? data.trips
    : Array.isArray(data)
    ? data
    : Array.isArray(data?.data?.trips)
    ? data.data.trips
    : Array.isArray(data?.data)
    ? data.data
    : []

  rows.forEach(captureFareCurrency)

  return {
    trips: rows.map(normalizeTrip).filter(Boolean),
    statusCounts: data?.statusCounts || {
      all: rows.length,
      pending: 0,
      dispatched: 0,
      ongoing: 0,
      completed: 0,
      cancelled: 0,
      scheduled: 0,
    },
    total: numOr(data?.pagination?.totalRecords ?? data?.pagination?.total ?? data?.total, rows.length),
    totalPages: Math.max(1, numOr(data?.pagination?.totalPages ?? data?.totalPages, 1)),
    page: Math.max(1, numOr(data?.pagination?.currentPage ?? data?.pagination?.page ?? data?.page, 1)),
    limit: numOr(data?.pagination?.limit ?? data?.limit, rows.length || 10),
  }
}

/**
 * Dispatcher API Service Functions
 */
export const dispatcherApi = {
  // 1. Dashboard KPIs & Summary Stats
  getStats: async () => {
    try {
      return await apiClient.get('/dispatcher/stats')
    } catch {
      return await apiClient.get('/company/trips/stats')
    }
  },

  // 2. All Trips List with Query filters
  getTrips: async (params = {}) => {
    try {
      const data = await apiClient.get('/dispatcher/trips', params)
      return normalizeTripListResponse(data)
    } catch {
      const data = await apiClient.get('/company/trips', params)
      return normalizeTripListResponse(data)
    }
  },

  // 3. Scheduled Trips
  getScheduledTrips: async (params = {}) => {
    try {
      const data = await apiClient.get('/dispatcher/scheduled-trips', params)
      return normalizeTripListResponse(data)
    } catch {
      try {
        const data = await apiClient.get('/company/trips/scheduled', params)
        return normalizeTripListResponse(data)
      } catch {
        const data = await apiClient.get('/company/trips?status=Scheduled', params)
        return normalizeTripListResponse(data)
      }
    }
  },

  // 4. Completed Trips
  getCompletedTrips: async (params = {}) => {
    try {
      const data = await apiClient.get('/dispatcher/completed-trips', params)
      return normalizeTripListResponse(data)
    } catch {
      try {
        const data = await apiClient.get('/company/trips/completed', params)
        return normalizeTripListResponse(data)
      } catch {
        const data = await apiClient.get('/company/trips?status=Completed', params)
        return normalizeTripListResponse(data)
      }
    }
  },

  // 5. Cancelled Trips
  getCancelledTrips: async (params = {}) => {
    try {
      const data = await apiClient.get('/dispatcher/cancelled-trips', params)
      return normalizeTripListResponse(data)
    } catch {
      try {
        const data = await apiClient.get('/company/trips/cancelled', params)
        return normalizeTripListResponse(data)
      } catch {
        const data = await apiClient.get('/company/trips?status=Cancelled', params)
        return normalizeTripListResponse(data)
      }
    }
  },

  // 6. Pending Trips
  getPendingTrips: async (params = {}) => {
    try {
      const data = await apiClient.get('/dispatcher/pending-trips', params)
      return normalizeTripListResponse(data)
    } catch {
      try {
        const data = await apiClient.get('/company/trips/pending', params)
        return normalizeTripListResponse(data)
      } catch {
        const data = await apiClient.get('/company/trips?status=Pending', params)
        return normalizeTripListResponse(data)
      }
    }
  },

  // 7. Active / Live Ongoing Trips
  getLiveTrips: async () => {
    try {
      const data = await apiClient.get('/dispatcher/live-trips')
      return normalizeTripListResponse(data)
    } catch {
      try {
        const data = await apiClient.get('/company/trips/active')
        return normalizeTripListResponse(data)
      } catch {
        const data = await apiClient.get('/company/trips?status=Ongoing')
        return normalizeTripListResponse(data)
      }
    }
  },

  // 8. Live Map of Drivers and Trips
  getLiveMap: async () => {
    try {
      return await apiClient.get('/dispatcher/live-map')
    } catch {
      try {
        return await apiClient.get('/company/trips/live-map')
      } catch {
        return await apiClient.get('/company/customers/live-map')
      }
    }
  },

  // 9. Single Trip Details
  getTripDetails: async (tripId) => {
    if (!tripId) throw new Error('Trip ID is required')
    try {
      const data = await apiClient.get(`/dispatcher/trips/${encodeURIComponent(tripId)}`)
      captureFareCurrency(data)
      return normalizeTrip(data)
    } catch {
      const data = await apiClient.get(`/company/trips/${encodeURIComponent(tripId)}`)
      captureFareCurrency(data)
      return normalizeTrip(data)
    }
  },

  // 10. Book / Create Trip (Dispatcher Assisted)
  bookTrip: async (payload) => {
    try {
      return await apiClient.post('/dispatcher/book-trip', payload)
    } catch {
      try {
        return await apiClient.post('/ride/dispatcher-book', payload)
      } catch {
        return await apiClient.post('/company/trips', payload)
      }
    }
  },

  // 11. Modify Trip Details
  modifyTrip: async (tripId, payload) => {
    if (!tripId) throw new Error('Trip ID is required')
    try {
      return await apiClient.patch(`/dispatcher/trips/${encodeURIComponent(tripId)}/modify`, payload)
    } catch {
      return await apiClient.patch(`/company/trips/${encodeURIComponent(tripId)}/modify`, payload)
    }
  },

  // 12. Auto Assign Driver
  autoAssignDriver: async (tripId) => {
    if (!tripId) throw new Error('Trip ID is required')
    try {
      return await apiClient.post(`/dispatcher/trips/${encodeURIComponent(tripId)}/auto-assign`)
    } catch {
      try {
        return await apiClient.post(`/company/trips/${encodeURIComponent(tripId)}/auto-assign`)
      } catch {
        return await apiClient.patch(`/company/trips/${encodeURIComponent(tripId)}/auto-assign`)
      }
    }
  },

  // 13. Manually Assign Driver
  assignDriver: async (tripId, driverId) => {
    if (!tripId) throw new Error('Trip ID is required')
    const body = typeof driverId === 'object' ? driverId : { driverId }
    try {
      return await apiClient.post(`/dispatcher/trips/${encodeURIComponent(tripId)}/assign-driver`, body)
    } catch (err) {
      if (err?.status === 404) {
        try {
          return await apiClient.post(`/company/trips/${encodeURIComponent(tripId)}/assign-driver`, body)
        } catch {
          return await apiClient.patch(`/company/trips/${encodeURIComponent(tripId)}/assign-driver`, body)
        }
      }
      throw err
    }
  },

  // 14. Cancel Trip
  cancelTrip: async (tripId, cancelReason = 'Cancelled by Dispatcher') => {
    if (!tripId) throw new Error('Trip ID is required')
    const body = typeof cancelReason === 'object' ? cancelReason : { cancelReason }
    try {
      return await apiClient.post(`/dispatcher/trips/${encodeURIComponent(tripId)}/cancel`, body)
    } catch {
      try {
        return await apiClient.post(`/company/trips/${encodeURIComponent(tripId)}/cancel`, body)
      } catch {
        return await apiClient.patch(`/company/trips/${encodeURIComponent(tripId)}/cancel`, body)
      }
    }
  },

  // 15. Delete Trip
  deleteTrip: async (tripId) => {
    if (!tripId) throw new Error('Trip ID is required')
    try {
      return await apiClient.delete(`/dispatcher/trips/${encodeURIComponent(tripId)}`)
    } catch {
      try {
        return await apiClient.delete(`/company/trips/${encodeURIComponent(tripId)}`)
      } catch {
        return await apiClient.delete(`/company/trips/${encodeURIComponent(tripId)}/delete`)
      }
    }
  },

  // 16. Notification APIs
  notifications: notificationService,
}

export { notificationService }
