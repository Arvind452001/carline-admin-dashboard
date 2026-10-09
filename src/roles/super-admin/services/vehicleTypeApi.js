import { apiClient, resolveUploadUrl } from '@/shared/services/apiClient'

// Swagger "Super Admin - Vehicle Types" tag:
//   POST   /super-admin/vehicle-types          create (JSON, or multipart with an image file)
//   GET    /super-admin/vehicle-types          paginated list (page, limit, search, status)
//   GET    /super-admin/vehicle-types/active   every Active row, unpaginated
//   GET    /super-admin/vehicle-types/{id}     one row
//   DELETE /super-admin/vehicle-types/{id}     delete
//   PUT    /super-admin/vehicle-types/update   update, with the id in the body
//   PATCH  /super-admin/vehicle-types/status   Active / Inactive
const BASE = '/super-admin/vehicle-types'

export const VEHICLE_TYPE_STATUS = { ACTIVE: 'Active', INACTIVE: 'Inactive' }

export const VEHICLE_TYPE_STATUS_OPTIONS = [
  { value: VEHICLE_TYPE_STATUS.ACTIVE, label: 'Active' },
  { value: VEHICLE_TYPE_STATUS.INACTIVE, label: 'Inactive' },
]

// The list filter is sent verbatim, so "All" means "leave the parameter off".
export const VEHICLE_TYPE_STATUS_FILTERS = [{ value: 'All', label: 'All' }, ...VEHICLE_TYPE_STATUS_OPTIONS]

const FIELD_LABELS = {
  perKmRate: 'Per kilometre rate',
  perMinuteRate: 'Per minute rate',
  sortOrder: 'Sort order',
}

const text = (value) => (value === undefined || value === null ? '' : String(value))

// Rates and sort order are optional in the DTO, so an absent value stays null
// rather than quietly becoming 0.
const numOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const numOr = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function normalizeVehicleType(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw._id ?? raw.id
  if (!id) return null

  const status =
    raw.status === VEHICLE_TYPE_STATUS.INACTIVE ? VEHICLE_TYPE_STATUS.INACTIVE : VEHICLE_TYPE_STATUS.ACTIVE

  return {
    id: String(id),
    name: text(raw.name),
    seats: numOr(raw.seats),
    badge: text(raw.badge),
    etaText: text(raw.etaText),
    basePrice: numOrNull(raw.basePrice),
    perKmRate: numOrNull(raw.perKmRate),
    perMinuteRate: numOrNull(raw.perMinuteRate),
    // `image` already arrives as an absolute URL, either a seeded stock photo or
    // an upload path; resolveUploadUrl only rewrites a bare storage key.
    image: raw.image ? resolveUploadUrl(raw.image) : '',
    description: text(raw.description),
    status,
    statusSlug: status === VEHICLE_TYPE_STATUS.ACTIVE ? 'active' : 'inactive',
    sortOrder: numOrNull(raw.sortOrder),
    createdAt: text(raw.createdAt),
    updatedAt: text(raw.updatedAt),
  }
}

// GET /super-admin/vehicle-types answers with
// { vehicleTypes, totalCount, totalPages, currentPage, limit }.
export function normalizeVehicleTypeList(data) {
  const rows = Array.isArray(data) ? data : Array.isArray(data?.vehicleTypes) ? data.vehicleTypes : []
  return {
    vehicleTypes: rows.map(normalizeVehicleType).filter(Boolean),
    total: numOr(data?.totalCount, rows.length),
    totalPages: Math.max(1, numOr(data?.totalPages, 1)),
    page: Math.max(1, numOr(data?.currentPage, 1)),
    limit: numOr(data?.limit, rows.length || 10),
  }
}

// Form values -> CreateVehicleTypeDto / UpdateVehicleTypeDto. An image file
// forces multipart, otherwise `imageUrl` travels as plain JSON and an emptied
// URL clears the stored image.
export function buildVehicleTypePayload(values, { includeId = false } = {}) {
  const name = text(values.name).trim()
  if (!name) throw new Error('Vehicle class name is required.')

  const seats = Number(values.seats)
  if (!Number.isFinite(seats) || seats <= 0) throw new Error('Seats must be a positive number.')

  const basePrice = Number(values.basePrice)
  if (!Number.isFinite(basePrice)) throw new Error('Base price must be a number.')

  const payload = {
    name,
    seats,
    basePrice,
    badge: text(values.badge).trim(),
    etaText: text(values.etaText).trim(),
    description: text(values.description).trim(),
    status: values.status === VEHICLE_TYPE_STATUS.INACTIVE ? VEHICLE_TYPE_STATUS.INACTIVE : VEHICLE_TYPE_STATUS.ACTIVE,
  }

  for (const key of ['perKmRate', 'perMinuteRate', 'sortOrder']) {
    const raw = values[key]
    if (raw === '' || raw === null || raw === undefined) continue
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) throw new Error(`${FIELD_LABELS[key]} must be a number.`)
    payload[key] = parsed
  }

  if (includeId) {
    if (!values.id) throw new Error('A vehicle type id is required to update it.')
    payload.id = values.id
  }

  // A chosen file wins over the URL field, so the two are never sent together.
  if (!values.imageFile) payload.imageUrl = text(values.imageUrl).trim()

  return payload
}

function toFormData(payload, file) {
  const form = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue
    form.append(key, String(value))
  }
  form.append('image', file)
  return form
}

export function listVehicleTypes({ page = 1, limit = 10, search = '', status = 'All' } = {}) {
  return apiClient
    .get(BASE, { page, limit, search, status: status && status !== 'All' ? status : undefined })
    .then(normalizeVehicleTypeList)
}

// Active rows come back as a bare array, not the paginated envelope.
export function listActiveVehicleTypes() {
  return apiClient
    .get(`${BASE}/active`)
    .then((data) => (Array.isArray(data) ? data : []).map(normalizeVehicleType).filter(Boolean))
}

export function getVehicleType(id) {
  if (!id) throw new Error('A vehicle type id is required.')
  return apiClient.get(`${BASE}/${encodeURIComponent(id)}`).then(normalizeVehicleType)
}

export function createVehicleType(values) {
  const payload = buildVehicleTypePayload(values)
  return values.imageFile ? apiClient.postForm(BASE, toFormData(payload, values.imageFile)) : apiClient.post(BASE, payload)
}

export function updateVehicleType(values) {
  const payload = buildVehicleTypePayload(values, { includeId: true })
  return values.imageFile
    ? apiClient.putForm(`${BASE}/update`, toFormData(payload, values.imageFile))
    : apiClient.put(`${BASE}/update`, payload)
}

export function updateVehicleTypeStatus(id, status) {
  if (!id) throw new Error('A vehicle type id is required.')
  return apiClient.patch(`${BASE}/status`, {
    id,
    status: status === VEHICLE_TYPE_STATUS.INACTIVE ? VEHICLE_TYPE_STATUS.INACTIVE : VEHICLE_TYPE_STATUS.ACTIVE,
  })
}

export function deleteVehicleType(id) {
  if (!id) throw new Error('A vehicle type id is required to delete it.')
  return apiClient.delete(`${BASE}/${encodeURIComponent(id)}`)
}

export { BASE as VEHICLE_TYPES_BASE }
