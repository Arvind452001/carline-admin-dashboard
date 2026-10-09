import { ApiError, apiClient, resolveUploadUrl } from '@/shared/services/apiClient'

// Swagger "Driver" tag endpoints a company panel can actually use:
//   GET   /driver/company-drivers/all?page&limit&search&status&vehicleType
//   GET   /driver/vehicle-types/all
//   PATCH /driver/status
//   PATCH /driver/vehicle-type
//
// Deliberately left out:
//   POST  /driver/register      - driver self sign-up, not an admin action
//   GET   /driver/profile       - the signed-in driver's own record; a company
//                                 admin has none, so the API answers 404
//   PATCH /driver/profile       - a driver editing their own record
//   GET   /driver/companies/all - super-admin scope
const LIST_PATH = '/driver/company-drivers/all'
const VEHICLE_TYPES_PATH = '/driver/vehicle-types/all'
const STATUS_PATH = '/driver/status'
const VEHICLE_TYPE_PATH = '/driver/vehicle-type'

// UpdateDriverStatusDto enum. `All` is the list endpoint's "no filter" value.
export const DRIVER_STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING_APPROVAL', label: 'Pending approval' },
  { value: 'ON_RIDE', label: 'On ride' },
  { value: 'ON_CALL', label: 'On call' },
  { value: 'OFF_DUTY', label: 'Off duty' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'REJECTED', label: 'Rejected' },
]

// The company panel only flips a driver between these two, so a row action can
// never send a status the API rejects.
export const DRIVER_ACTIVE_STATUS = 'ACTIVE'
export const DRIVER_INACTIVE_STATUS = 'INACTIVE'
export const DRIVER_PENDING_STATUS = 'PENDING_APPROVAL'
export const DRIVER_REJECTED_STATUS = 'REJECTED'

// PATCH /driver/status documents ACTIVE as "approve", so the very same call
// reads as Approve for a pending or rejected driver and as Deactivate once the
// driver is active. Pages append their own noun.
export function driverStatusActionLabel(status) {
  if (status === DRIVER_ACTIVE_STATUS) return 'Deactivate'
  if (status === DRIVER_INACTIVE_STATUS) return 'Activate'
  return 'Approve'
}

// Backend codes -> StatusBadge slugs.
const STATUS_SLUGS = {
  PENDING_APPROVAL: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_RIDE: 'on-trip',
  ON_CALL: 'online',
  OFF_DUTY: 'offline',
  REJECTED: 'suspended',
}

const DEFAULT_STATUS = 'PENDING_APPROVAL'

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

// The list envelope is not pinned down by Swagger, so accept either a bare
// array or the usual `{ drivers: [...] }` / `{ data: [...] }` wrappers.
function listRows(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  for (const key of ['drivers', 'data', 'results', 'items', 'list', 'docs']) {
    if (Array.isArray(payload[key])) return payload[key]
  }
  return []
}

function listMeta(payload) {
  const empty = { total: 0, page: 1, limit: 0, totalPages: 1 }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return empty
  const meta = payload.pagination || payload.meta || payload
  const total = numOr(meta.total ?? meta.totalRecords ?? meta.totalCount ?? meta.count)
  const limit = numOr(meta.limit ?? meta.pageSize)
  const totalPages = numOr(
    meta.totalPages,
    limit > 0 ? Math.ceil(total / limit) : 1
  )
  return {
    total,
    page: Math.max(1, numOr(meta.page ?? meta.currentPage, 1)),
    limit,
    totalPages: Math.max(1, totalPages),
  }
}

// `vehicleTypeId` is the canonical link to the vehicle-types collection while
// `vehicleType` carries the display name, and the name is what the list
// endpoint's `vehicleType` filter matches on.
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
  const status = String(raw.status ?? raw.driverStatus ?? DEFAULT_STATUS).trim().toUpperCase()
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
    vehicleType: type.name,
    plate: firstString(
      raw.vehicleRegistrationNumber,
      vehicle.registrationNumber,
      raw.plateNumber,
      raw.vehicleNumber,
      raw.plate
    ),
    make: firstString(raw.make, vehicle.make),
    modelAndYear: firstString(raw.modelAndYear, vehicle.modelAndYear),
    fuelType: firstString(raw.fuelType, vehicle.fuelType),
    transmission: firstString(raw.transmission, vehicle.transmission),
    // The API has sent these both as bare storage keys and as full URLs, so they
    // are resolved once here and every consumer gets something usable.
    avatar: resolveUploadUrl(firstString(raw.avatar, raw.profileImage, raw.image)),
    rating: raw.rating ?? raw.averageRating ?? raw.avgRating ?? null,
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

export async function listCompanyDrivers({ page = 1, limit = 10, search, status, vehicleType } = {}) {
  const payload = await apiClient.get(LIST_PATH, {
    page,
    limit,
    search: search || undefined,
    // `All` means "no status filter" and has to be dropped, not sent.
    status: status && status !== 'All' ? status : undefined,
    vehicleType: vehicleType || undefined,
  })
  const drivers = listRows(payload).map(normalizeDriver).filter(Boolean)
  const meta = listMeta(payload)
  // A response that carries no counters would otherwise label visible rows as
  // "0 drivers", so fall back to what actually came back.
  const total = meta.total || drivers.length
  return {
    drivers,
    total,
    page: meta.page,
    limit: meta.limit,
    totalPages: meta.total ? meta.totalPages : Math.max(1, Math.ceil(total / (meta.limit || limit))),
  }
}

export async function listVehicleTypes() {
  const payload = await apiClient.get(VEHICLE_TYPES_PATH)
  return listRows(payload)
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const id = firstString(item._id, item.id)
      const name = firstString(item.name, item.title, item.label)
      if (!id && !name) return null
      return { id: id || name, name: name || id, status: firstString(item.status) }
    })
    .filter(Boolean)
}

// The list filter documents `vehicleType` as the type's name (e.g. "Sedan"),
// so the name is what gets sent rather than the id.
export function vehicleTypeOptions(types) {
  return [
    { value: '', label: 'All vehicle types' },
    ...types.map((type) => ({ value: type.name, label: type.name })),
  ]
}

export function updateDriverStatus({ driverId, status, rejectionReason }) {
  const body = { driverId, status }
  // UpdateDriverStatusDto documents rejectionReason as "applicable when status
  // is REJECTED", so it is only attached when the caller actually supplies one.
  const reason = firstString(rejectionReason).trim()
  if (reason) body.rejectionReason = reason
  return apiClient.patch(STATUS_PATH, body)
}

export function updateDriverVehicleType({ driverId, vehicleType }) {
  return apiClient.patch(VEHICLE_TYPE_PATH, { driverId, vehicleType })
}

// The Driver tag exposes no `GET /driver/{id}`, so the detail page has to find
// its driver inside the list. A fleet is small enough that walking the pages
// stays cheap, and it keeps working once the fleet outgrows a single page.
export async function getCompanyDriver(driverId, { pageSize = 100, maxPages = 10 } = {}) {
  const id = String(driverId ?? '').trim()
  if (!id) throw new ApiError('A driver id is required.', { status: 400 })

  for (let page = 1; page <= maxPages; page += 1) {
    const { drivers, totalPages } = await listCompanyDrivers({ page, limit: pageSize })
    const found = drivers.find((driver) => driver.id === id)
    if (found) return found
    if (page >= totalPages) break
  }

  throw new ApiError('Driver not found.', { status: 404 })
}

export function driverStatusLabel(code) {
  const option = DRIVER_STATUS_OPTIONS.find((item) => item.value === code)
  return option ? option.label : firstString(code) || 'Unknown'
}
