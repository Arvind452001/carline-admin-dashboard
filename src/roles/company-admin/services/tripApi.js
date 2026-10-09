import { apiClient, resolveUploadUrl } from '@/shared/services/apiClient'
import { setCurrencySymbol } from '@/shared/utils/formatting'

// Swagger "Company Trips" tag:
//   GET /company/trips?page&limit&search&status&startDate&endDate&companyId
//   GET /company/trips/{id}
//
// The company scope comes from the Bearer token, so companyId is only needed by
// a SuperAdmin inspecting a specific company.
const BASE = '/company/trips'

// The list endpoint's `status` query is a tab enum, not the RideStatus enum.
export const TRIP_STATUS_TABS = [
  { value: 'All', label: 'All', countKey: 'all' },
  { value: 'Pending', label: 'Pending', countKey: 'pending' },
  { value: 'Dispatched', label: 'Dispatched', countKey: 'dispatched' },
  { value: 'Ongoing', label: 'Ongoing', countKey: 'ongoing' },
  { value: 'Completed', label: 'Completed', countKey: 'completed' },
  { value: 'Cancelled', label: 'Cancelled', countKey: 'cancelled' },
  { value: 'Scheduled', label: 'Scheduled', countKey: 'scheduled' },
]

// Both endpoints answer with a status, but the list sends the friendly tab name
// while the detail sends the raw RideStatus enum.
const FRIENDLY_SLUGS = ['pending', 'dispatched', 'ongoing', 'scheduled', 'completed', 'cancelled']

const RAW_STATUS_SLUGS = {
  SEARCHING_DRIVER: 'pending',
  SCHEDULED: 'scheduled',
  DRIVER_ASSIGNED: 'dispatched',
  DRIVER_ARRIVED: 'dispatched',
  RIDE_STARTED: 'ongoing',
  RIDE_COMPLETED: 'completed',
  RIDE_CANCELLED: 'cancelled',
}

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

export function tripStatusSlug(raw) {
  const friendly = str(raw?.status).trim().toLowerCase()
  if (FRIENDLY_SLUGS.includes(friendly)) return friendly

  const code = str(raw?.rawStatus || raw?.status).trim().toUpperCase()
  if (RAW_STATUS_SLUGS[code]) return RAW_STATUS_SLUGS[code]
  return 'pending'
}

export function tripStatusLabel(raw) {
  const slug = tripStatusSlug(raw)
  const tab = TRIP_STATUS_TABS.find((item) => item.countKey === slug)
  return tab ? tab.label : 'Pending'
}

// Every fare carries its own currency, so the panel's shared formatter follows
// whatever the API reports instead of a hardcoded symbol. A plain code such as
// "USD" is ignored: only an actual symbol replaces the formatter's.
function captureFareCurrency(payload) {
  const symbol = payload?.fare?.currency ?? payload?.currency
  if (typeof symbol !== 'string') return
  const trimmed = symbol.trim()
  if (!trimmed || /^[A-Za-z]{2,}$/.test(trimmed)) return
  setCurrencySymbol(trimmed)
}

function normalizePlace(place) {
  if (!place || typeof place !== 'object') return { address: '', latitude: null, longitude: null }
  return {
    address: str(place.address),
    latitude: numOrNull(place.latitude),
    longitude: numOrNull(place.longitude),
  }
}

function normalizeFare(fare) {
  const raw = fare && typeof fare === 'object' ? fare : {}
  return {
    amount: numOrNull(raw.amount ?? raw.payableFare),
    payableFare: numOrNull(raw.payableFare),
    totalFare: numOrNull(raw.totalFare),
    discount: numOrNull(raw.discount),
    promoCode: str(raw.promoCode),
    currency: str(raw.currency),
    paymentMethod: str(raw.paymentMethod),
    paymentStatus: str(raw.paymentStatus).toLowerCase(),
    breakdown: raw.breakdown && typeof raw.breakdown === 'object' ? raw.breakdown : null,
  }
}

function displayTripId(id, tripId) {
  return str(tripId) || `TRP-${String(id).slice(-4).toUpperCase()}`
}

export function normalizeTrip(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw._id ?? raw.id
  if (!id) return null

  const rideType = str(raw.rideType) || 'INSTANT'

  return {
    id: String(id),
    tripId: displayTripId(id, raw.tripId),
    customer: {
      id: str(raw.customer?.id),
      name: str(raw.customer?.name) || 'Customer',
      phone: str(raw.customer?.phone),
      email: str(raw.customer?.email),
      avatar: resolveUploadUrl(str(raw.customer?.avatar)),
    },
    driver: raw.driver
      ? {
          id: str(raw.driver.id),
          name: str(raw.driver.name) || 'Assigned driver',
          phone: str(raw.driver.phone),
          vehicleType: str(raw.driver.vehicleType),
          plate: str(raw.driver.vehicleRegistrationNumber),
          avatar: resolveUploadUrl(str(raw.driver.avatar)),
        }
      : null,
    company: raw.company
      ? { id: str(raw.company.id), name: str(raw.company.name), code: str(raw.company.code) }
      : null,
    pickup: normalizePlace(raw.pickup),
    dropoff: normalizePlace(raw.dropoff),
    fare: normalizeFare(raw.fare),
    statusSlug: tripStatusSlug(raw),
    rawStatus: str(raw.rawStatus),
    rideType,
    distanceKm: numOr(raw.distanceKm),
    durationMinutes: numOr(raw.durationMinutes),
    scheduledAt: raw.scheduledAt || '',
    createdAt: raw.createdAt || '',
  }
}

const EMPTY_COUNTS = { all: 0, pending: 0, dispatched: 0, ongoing: 0, completed: 0, cancelled: 0, scheduled: 0 }

export function normalizeTripList(data) {
  const rows = Array.isArray(data?.trips) ? data.trips : []
  rows.forEach(captureFareCurrency)

  const counts = { ...EMPTY_COUNTS }
  for (const key of Object.keys(counts)) counts[key] = numOr(data?.statusCounts?.[key], 0)

  return {
    trips: rows.map(normalizeTrip).filter(Boolean),
    statusCounts: counts,
    total: numOr(data?.pagination?.totalRecords, rows.length),
    totalPages: Math.max(1, numOr(data?.pagination?.totalPages, 1)),
    page: Math.max(1, numOr(data?.pagination?.currentPage, 1)),
    limit: numOr(data?.pagination?.limit, rows.length || 10),
  }
}

// The detail endpoint names the customer `passenger` and exposes the raw status
// plus a timeline, which the list does not.
export function normalizeTripDetail(data) {
  if (!data || typeof data !== 'object') return null
  const id = data._id ?? data.id
  if (!id) return null

  const rideType = str(data.rideType) || 'INSTANT'
  const fare = normalizeFare(data.fare)
  fare.breakdown = data.fare?.breakdown && typeof data.fare.breakdown === 'object' ? data.fare.breakdown : null

  return {
    id: String(id),
    tripId: displayTripId(id, data.tripId),
    passenger: {
      id: str(data.passenger?.id),
      name: str(data.passenger?.name) || 'Customer',
      phone: str(data.passenger?.phone),
      email: str(data.passenger?.email),
      avatar: resolveUploadUrl(str(data.passenger?.avatar)),
    },
    driver: data.driver
      ? {
          id: str(data.driver.id),
          name: str(data.driver.name) || 'Assigned driver',
          phone: str(data.driver.phone),
          email: str(data.driver.email),
          vehicleType: str(data.driver.vehicleType),
          plate: str(data.driver.vehicleRegistrationNumber),
          make: str(data.driver.make),
          modelAndYear: str(data.driver.modelAndYear),
          avatar: resolveUploadUrl(str(data.driver.avatar)),
          rating: numOrNull(data.driver.rating),
        }
      : null,
    company: data.company
      ? { id: str(data.company.id), name: str(data.company.name), code: str(data.company.code) }
      : null,
    pickup: normalizePlace(data.pickup),
    dropoff: normalizePlace(data.dropoff),
    fare,
    statusSlug: tripStatusSlug({ status: data.status, rideType }),
    rawStatus: str(data.status),
    rideType,
    distanceKm: numOr(data.distanceKm),
    durationMinutes: numOr(data.durationMinutes),
    etaMinutes: numOrNull(data.etaMinutes),
    scheduledAt: data.scheduledAt || '',
    timeline: {
      createdAt: data.timeline?.createdAt || '',
      driverAssignedAt: data.timeline?.driverAssignedAt || '',
      startedAt: data.timeline?.startedAt || '',
      completedAt: data.timeline?.completedAt || '',
      cancelledAt: data.timeline?.cancelledAt || '',
      cancelledBy: str(data.timeline?.cancelledBy),
      cancelReason: str(data.timeline?.cancelReason),
    },
  }
}

export function listCompanyTrips({ page = 1, limit = 10, search = '', status = 'All', startDate = '', endDate = '' } = {}) {
  return apiClient
    .get(BASE, { page, limit, search, status, startDate, endDate })
    .then(normalizeTripList)
}

export function getCompanyTrip(tripId) {
  if (!tripId) throw new Error('A trip id is required.')
  return apiClient.get(`${BASE}/${encodeURIComponent(tripId)}`).then((data) => {
    captureFareCurrency(data)
    return normalizeTripDetail(data)
  })
}

export { BASE as COMPANY_TRIPS_BASE }

export function createDispatcherTrip(payload) { return apiClient.post(BASE, payload); }
export function listPassengerVehicleTypes() { return apiClient.get('/ride/vehicle-types'); }
export function modifyCompanyTrip(tripId, payload) { return apiClient.patch(BASE + '/' + encodeURIComponent(tripId) + '/modify', payload); }
