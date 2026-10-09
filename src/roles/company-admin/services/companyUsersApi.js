import { apiClient } from '@/shared/services/apiClient'
import { normalizeRole, toBackendRole } from '@/access/roleMap'

// Implements the Swagger "Company Users" tag for the signed-in company:
//   POST   /company/users                              create + email credentials
//   GET    /company/users?page&limit&search&role&status
//   PUT    /company/users                              update (id travels in the body)
//   GET    /company/users/{id}
//   DELETE /company/users/{id}
//   PATCH  /company/users/status
//   POST   /company/users/{id}/resend-credentials
const BASE = '/company/users'

// The API takes upper-case statuses; the panel uses lowercase slugs.
const API_STATUS = { active: 'ACTIVE', inactive: 'INACTIVE' }

export function toApiStatus(value) {
  if (!value) return undefined
  return API_STATUS[String(value).trim().toLowerCase()] || String(value).toUpperCase()
}

export function fromApiStatus(value) {
  return value ? String(value).trim().toLowerCase() : 'unknown'
}

// Response field names are not documented in the spec, so reads stay tolerant of
// camelCase / snake_case / alternate spellings instead of assuming one shape.
const PLACEHOLDERS = new Set(['[object Object]', 'undefined', 'null', 'NaN'])

function isUsable(value) {
  if (value === undefined || value === null || value === '') return false
  if (typeof value === 'string' && PLACEHOLDERS.has(value.trim())) return false
  return true
}

function pick(source, keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (isUsable(value)) return value
  }
  return undefined
}

export function normalizeCompanyUser(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = pick(raw, ['_id', 'id', 'userId', 'companyUserId'])
  // A create/update response may come back without the record, so require an id.
  if (!id) return null

  const roleCode = pick(raw, ['role', 'roles'])
  const fullName =
    pick(raw, ['fullName', 'name', 'displayName']) ||
    [pick(raw, ['firstName']), pick(raw, ['lastName'])].filter(Boolean).join(' ')

  return {
    id: String(id),
    name: fullName || '?',
    email: pick(raw, ['email']) || '?',
    phone: pick(raw, ['phoneNumber', 'phone', 'mobile']) || '?',
    // Panel slug for display/labels, plus the raw code for a safe fallback.
    role: normalizeRole(roleCode),
    roleCode: roleCode ? String(roleCode).toUpperCase() : '',
    status: fromApiStatus(pick(raw, ['status', 'accountStatus'])),
    createdAt: pick(raw, ['createdAt', 'created_at']) || '',
  }
}

const LIST_KEYS = ['items', 'users', 'rows', 'results', 'records', 'list', 'data']

export function normalizeCompanyUserList(data) {
  if (Array.isArray(data)) {
    return { items: data.map(normalizeCompanyUser).filter(Boolean), total: data.length, page: 1, totalPages: 1 }
  }
  if (!data || typeof data !== 'object') {
    return { items: [], total: 0, page: 1, totalPages: 1 }
  }

  const listKey = LIST_KEYS.find((key) => Array.isArray(data[key]))
  if (!listKey) {
    // Fail loudly with the real keys so the response shape can be reported.
    throw new Error(`Unexpected company users response. Keys received: ${Object.keys(data).join(', ') || '(none)'}`)
  }

  const items = data[listKey].map(normalizeCompanyUser).filter(Boolean)
  const total = Number(pick(data, ['total', 'totalCount', 'totalRecords', 'count']) ?? items.length)
  const limit = Number(pick(data, ['limit', 'perPage', 'pageSize']) ?? (items.length || 1))
  const page = Number(pick(data, ['page', 'currentPage', 'pageNumber']) ?? 1)
  const totalPages = Number(
    pick(data, ['totalPages', 'totalPage', 'pages', 'lastPage']) ?? Math.max(1, Math.ceil(total / (limit || 1)))
  )

  return { items, total, page, limit, totalPages }
}

// Form state -> CreateCompanyUserDto / UpdateCompanyUserDto field names.
function toUserPayload(values) {
  const role = toBackendRole(values.role)
  return {
    fullName: values.fullName?.trim(),
    email: values.email?.trim(),
    ...(role ? { role } : {}),
    status: toApiStatus(values.status),
    ...(values.phoneNumber?.trim() ? { phoneNumber: values.phoneNumber.trim() } : {}),
  }
}

export function listCompanyUsers({ page, limit, search, role, status } = {}) {
  // "all" is the panel's own sentinel for no filter, so it never reaches the API.
  const roleParam = !role || role === 'all' ? undefined : toBackendRole(role)
  const statusParam = !status || status === 'all' ? undefined : toApiStatus(status)
  return apiClient
    .get(BASE, { page, limit, search, role: roleParam, status: statusParam })
    .then(normalizeCompanyUserList)
}

export function getCompanyUser(id) {
  return apiClient.get(`${BASE}/${encodeURIComponent(id)}`).then((data) => normalizeCompanyUser(data?.user || data))
}

export function createCompanyUser(values) {
  return apiClient.post(BASE, toUserPayload(values)).then((data) => normalizeCompanyUser(data?.user || data))
}

export function updateCompanyUser(values) {
  return apiClient
    .put(BASE, { id: values.id, ...toUserPayload(values) })
    .then((data) => normalizeCompanyUser(data?.user || data))
}

export function updateCompanyUserStatus(id, status) {
  return apiClient.patch(`${BASE}/status`, { id, status: toApiStatus(status) })
}

export function deleteCompanyUser(id) {
  return apiClient.delete(`${BASE}/${encodeURIComponent(id)}`)
}

export function resendCompanyUserCredentials(id) {
  return apiClient.post(`${BASE}/${encodeURIComponent(id)}/resend-credentials`)
}

export { BASE as COMPANY_USERS_BASE }
