import { apiClient, ApiError, resolveUploadUrl } from '@/shared/services/apiClient'

// Endpoints for Driver Manager (by Prakash Mishra):
// 1. PATCH /api/v1/ride/{id}/adjust-waiting-charge
// 2. GET   /api/v1/driver/company-drivers/all
// 3. PATCH /api/v1/driver/status
// 4. PATCH /api/v1/driver/vehicle-type
// 5. GET   /api/v1/pricing/waiting-charges
// 6. POST  /api/v1/pricing/waiting-charges
// 7. PUT   /api/v1/pricing/waiting-charges
// Plus vehicle types lookup: GET /api/v1/driver/vehicle-types/all

const DRIVERS_LIST_PATH = '/driver/company-drivers/all'
const DRIVER_STATUS_PATH = '/driver/status'
const DRIVER_VEHICLE_TYPE_PATH = '/driver/vehicle-type'
const VEHICLE_TYPES_PATH = '/driver/vehicle-types/all'
const WAITING_CHARGES_PATH = '/pricing/waiting-charges'

export const DRIVER_STATUS_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'ON_RIDE', label: 'On Ride' },
  { value: 'ON_CALL', label: 'On Call' },
  { value: 'OFF_DUTY', label: 'Off Duty' },
  { value: 'INACTIVE', label: 'Inactive / Suspended' },
  { value: 'REJECTED', label: 'Rejected' },
]

export const DRIVER_STATUS_ENUM = {
  ACTIVE: 'ACTIVE',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  ON_RIDE: 'ON_RIDE',
  ON_CALL: 'ON_CALL',
  OFF_DUTY: 'OFF_DUTY',
  INACTIVE: 'INACTIVE',
  REJECTED: 'REJECTED',
}

const STATUS_SLUGS = {
  PENDING_APPROVAL: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_RIDE: 'on-trip',
  ON_CALL: 'online',
  OFF_DUTY: 'offline',
  REJECTED: 'suspended',
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function numOr(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function driverStatusSlug(code) {
  const upper = String(code ?? '').trim().toUpperCase()
  if (!upper) return 'inactive'
  return STATUS_SLUGS[upper] ?? upper.toLowerCase()
}

export function driverStatusLabel(code) {
  const upper = String(code ?? '').trim().toUpperCase()
  const found = DRIVER_STATUS_OPTIONS.find((opt) => opt.value === upper)
  return found ? found.label : code || 'Unknown'
}

function listRows(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  for (const key of ['drivers', 'data', 'results', 'items', 'list', 'docs']) {
    if (Array.isArray(payload[key])) return payload[key]
  }
  return []
}

function listMeta(payload) {
  const empty = { total: 0, page: 1, limit: 10, totalPages: 1 }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return empty
  const meta = payload.pagination || payload.meta || payload
  const total = numOr(meta.total ?? meta.totalRecords ?? meta.totalCount ?? meta.count)
  const limit = numOr(meta.limit ?? meta.pageSize, 10)
  const totalPages = numOr(meta.totalPages, limit > 0 ? Math.ceil(total / limit) : 1)
  return {
    total,
    page: Math.max(1, numOr(meta.page ?? meta.currentPage, 1)),
    limit,
    totalPages: Math.max(1, totalPages),
  }
}

function vehicleTypeParts(raw) {
  const source = raw.vehicleType
  const id = firstString(raw.vehicleTypeId)
  const name = firstString(raw.vehicleTypeName)
  if (source && typeof source === 'object') {
    return {
      id: id || firstString(source._id, source.id),
      name: name || firstString(source.name, source.title, source.label),
    }
  }
  const value = firstString(source)
  return { id: id || value, name: name || value }
}

export function normalizeDriver(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw._id ?? raw.id ?? raw.driverId
  if (!id) return null
  const vehicle = raw.vehicle && typeof raw.vehicle === 'object' ? raw.vehicle : {}
  const type = vehicleTypeParts(raw)
  const status = String(raw.status ?? raw.driverStatus ?? 'PENDING_APPROVAL').trim().toUpperCase()

  return {
    id: String(id),
    name:
      firstString(raw.fullName, raw.name, `${firstString(raw.firstName)} ${firstString(raw.lastName)}`.trim()) ||
      'Unnamed driver',
    phone: firstString(raw.phoneNumber, raw.phone, raw.mobileNumber, raw.mobile),
    email: firstString(raw.email, raw.emailAddress),
    licenseNumber: firstString(raw.licenseNumber, raw.drivingLicenseNumber),
    licenseClass: firstString(raw.licenseClass),
    licenseIssueDate: firstString(raw.issueDate),
    licenseExpiryDate: firstString(raw.expiryDate),
    dateOfBirth: firstString(raw.dateOfBirth),
    gender: firstString(raw.gender),
    employmentType: firstString(raw.employmentType),
    serviceArea: firstString(raw.preferredServiceArea),
    vehicleTypeId: type.id,
    vehicleType: type.name || 'Unassigned',
    plate: firstString(
      raw.vehicleRegistrationNumber,
      vehicle.registrationNumber,
      raw.plateNumber,
      raw.vehicleNumber,
      raw.plate
    ) || 'Not registered',
    make: firstString(raw.make, vehicle.make),
    modelAndYear: firstString(raw.modelAndYear, vehicle.modelAndYear, raw.model),
    fuelType: firstString(raw.fuelType, vehicle.fuelType),
    transmission: firstString(raw.transmission, vehicle.transmission),
    avatar: resolveUploadUrl(firstString(raw.avatar, raw.profileImage, raw.image)),
    rating: raw.rating ?? raw.averageRating ?? raw.avgRating ?? '5.0',
    trips: numOr(raw.tripsCount ?? raw.totalTrips ?? raw.trips, 0),
    earnings: raw.earnings ?? raw.totalEarnings ?? '$0.00',
    isOnline: raw.isOnline === true,
    isVerified: raw.isVerified === true,
    isActive: raw.isActive === true,
    termsAccepted: raw.termsAccepted === true,
    onlineSince: raw.onlineSince || '',
    onlineStatsSeconds: numOr(raw.onlineStatsSeconds),
    latitude: raw.currentLatitude ?? null,
    longitude: raw.currentLongitude ?? null,
    lastLocationAt: raw.lastLocationAt || '',
    rejectionReason: firstString(raw.rejectionReason),
    governmentIdUrl: resolveUploadUrl(firstString(raw.governmentIdUrl)),
    licenseCopyUrl: resolveUploadUrl(firstString(raw.licenseCopyUrl)),
    vehicleRegistrationDocUrl: resolveUploadUrl(firstString(raw.vehicleRegistrationDocUrl)),
    insuranceProofUrl: resolveUploadUrl(firstString(raw.insuranceProofUrl)),
    status,
    statusSlug: driverStatusSlug(status),
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || '',
  }
}

/**
 * 2. GET /api/v1/driver/company-drivers/all
 * List all company drivers with search, status and vehicle type filters
 */
export async function listCompanyDrivers({ page = 1, limit = 10, search, status, vehicleType, companyId } = {}) {
  const query = {
    page,
    limit,
    search: search || undefined,
    status: status && status !== 'All' ? status : undefined,
    vehicleType: vehicleType && vehicleType !== 'all' ? vehicleType : undefined,
    companyId: companyId || undefined,
  }

  const payload = await apiClient.get(DRIVERS_LIST_PATH, query)
  const rows = listRows(payload)
  const drivers = rows.map(normalizeDriver).filter(Boolean)
  const meta = listMeta(payload)
  const total = meta.total || drivers.length

  return {
    drivers,
    total,
    page: meta.page,
    limit: meta.limit,
    totalPages: meta.total ? meta.totalPages : Math.max(1, Math.ceil(total / (meta.limit || limit))),
  }
}

/**
 * 3. PATCH /api/v1/driver/status
 * Update driver status - Approve, Reject, Suspend or Activate (Driver Manager)
 */
export async function updateDriverStatus({ driverId, status, rejectionReason }) {
  if (!driverId) throw new Error('Driver ID is required')
  if (!status) throw new Error('Status is required')

  const body = {
    driverId,
    status: String(status).toUpperCase(),
  }

  if (rejectionReason && String(rejectionReason).trim()) {
    body.rejectionReason = String(rejectionReason).trim()
  }

  return apiClient.patch(DRIVER_STATUS_PATH, body)
}

/**
 * 4. PATCH /api/v1/driver/vehicle-type
 * Assign / update vehicle type for a driver (Driver Manager)
 */
export async function updateDriverVehicleType({ driverId, vehicleType }) {
  if (!driverId) throw new Error('Driver ID is required')
  if (!vehicleType) throw new Error('Vehicle Type is required')

  const body = {
    driverId,
    vehicleType,
  }

  return apiClient.patch(DRIVER_VEHICLE_TYPE_PATH, body)
}

/**
 * Vehicle Types List: GET /api/v1/driver/vehicle-types/all
 */
export async function listVehicleTypes() {
  const payload = await apiClient.get(VEHICLE_TYPES_PATH)
  const items = listRows(payload)
  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const id = firstString(item._id, item.id)
      const name = firstString(item.name, item.title, item.label)
      if (!id && !name) return null
      return {
        id: id || name,
        name: name || id,
        seats: item.seats || 4,
        badge: item.badge || null,
        basePrice: item.basePrice || 0,
        perKmRate: item.perKmRate || 0,
        perMinuteRate: item.perMinuteRate || 0,
        image: item.image || '',
        status: firstString(item.status) || 'Active',
      }
    })
    .filter(Boolean)
}

function unwrapWaitingData(data) {
  if (!data || typeof data !== 'object') return null
  const source = data.waitingCharges || data.waitingCharge || data.pricing || data.data || data
  const grace = source.gracePeriodMinutes ?? source.grace_period_minutes ?? source.gracePeriod
  const rate = source.waitingChargePerMinute ?? source.waiting_charge_per_minute ?? source.ratePerMinute
  return {
    gracePeriodMinutes: grace !== undefined && grace !== null && grace !== '' ? Number(grace) : 5,
    waitingChargePerMinute: rate !== undefined && rate !== null && rate !== '' ? Number(rate) : 0.3,
    companyId: source.companyId || source.company || '',
    configured: grace !== undefined && grace !== null,
    updatedAt: source.updatedAt || '',
  }
}

/**
 * 5. GET /api/v1/pricing/waiting-charges
 * Get waiting charges policy for company (free grace period minutes and rate per minute)
 */
export async function getWaitingChargesPolicy(companyId) {
  try {
    const payload = await apiClient.get(WAITING_CHARGES_PATH, companyId ? { companyId } : undefined)
    return unwrapWaitingData(payload) || { gracePeriodMinutes: 5, waitingChargePerMinute: 0.3, configured: false }
  } catch (err) {
    if (err instanceof ApiError && (/not configured/i.test(err.message || '') || err.status === 404)) {
      return { gracePeriodMinutes: 5, waitingChargePerMinute: 0.3, configured: false }
    }
    throw err
  }
}

/**
 * 6. POST /api/v1/pricing/waiting-charges
 * Set waiting charges policy by Company Admin or Driver Manager
 */
export async function setWaitingChargesPolicy({ gracePeriodMinutes, waitingChargePerMinute, companyId }) {
  const grace = Number(gracePeriodMinutes)
  const rate = Number(waitingChargePerMinute)

  if (!Number.isFinite(grace) || grace < 0) throw new Error('Grace period must be 0 or more minutes.')
  if (!Number.isFinite(rate) || rate < 0) throw new Error('Waiting charge per minute must be 0 or more.')

  const body = {
    gracePeriodMinutes: grace,
    waitingChargePerMinute: rate,
  }
  if (companyId) body.companyId = companyId

  return apiClient.post(WAITING_CHARGES_PATH, body)
}

/**
 * 7. PUT /api/v1/pricing/waiting-charges
 * Update waiting charges policy by Company Admin or Driver Manager
 */
export async function updateWaitingChargesPolicy({ gracePeriodMinutes, waitingChargePerMinute, companyId }) {
  const grace = Number(gracePeriodMinutes)
  const rate = Number(waitingChargePerMinute)

  if (!Number.isFinite(grace) || grace < 0) throw new Error('Grace period must be 0 or more minutes.')
  if (!Number.isFinite(rate) || rate < 0) throw new Error('Waiting charge per minute must be 0 or more.')

  const body = {
    gracePeriodMinutes: grace,
    waitingChargePerMinute: rate,
  }
  if (companyId) body.companyId = companyId

  return apiClient.put(WAITING_CHARGES_PATH, body)
}

/**
 * Helper to save policy intelligently (POST if not configured yet, PUT if updating)
 */
export async function saveWaitingChargesPolicy(values, isConfigured = false, companyId) {
  try {
    if (isConfigured) {
      return await updateWaitingChargesPolicy({ ...values, companyId })
    }
    return await setWaitingChargesPolicy({ ...values, companyId })
  } catch (err) {
    // If PUT fails because it was never created, fall back to POST, and vice-versa
    if (!isConfigured) {
      return await updateWaitingChargesPolicy({ ...values, companyId })
    }
    return await setWaitingChargesPolicy({ ...values, companyId })
  }
}

/**
 * 1. PATCH /api/v1/ride/{id}/adjust-waiting-charge
 * Company Admin and Driver Manager can decide, adjust or waive waiting charges for a ride
 */
export async function adjustRideWaitingCharge(rideId, { waitingCharge, waitingMinutes, reason }) {
  const cleanId = String(rideId ?? '').trim()
  if (!cleanId) throw new Error('Ride ID is required.')

  const charge = Number(waitingCharge)
  if (!Number.isFinite(charge) || charge < 0) {
    throw new Error('Waiting charge amount must be a number 0 or greater (set 0 to waive).')
  }

  const body = {
    waitingCharge: charge,
  }

  if (waitingMinutes !== undefined && waitingMinutes !== null && waitingMinutes !== '') {
    const mins = Number(waitingMinutes)
    if (!Number.isFinite(mins) || mins < 0) {
      throw new Error('Waiting minutes must be a number 0 or greater.')
    }
    body.waitingMinutes = mins
  }

  if (reason && String(reason).trim()) {
    body.reason = String(reason).trim()
  }

  return apiClient.patch(`/ride/${encodeURIComponent(cleanId)}/adjust-waiting-charge`, body)
}
