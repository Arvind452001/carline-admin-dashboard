import { apiClient } from '@/shared/services/apiClient'

// Implements the Swagger "Super Admin" tag:
//   POST   /super-admin/login
//   GET    /super-admin/companies
//   GET    /super-admin/companies/{id}
//   POST   /super-admin/companies
//   PUT    /super-admin/companies   (id travels in the body)
//   PATCH  /super-admin/companies/status
const BASE = '/super-admin'

// The API uses Title Case statuses; the panel uses lowercase slugs.
const API_STATUS = { active: 'Active', suspended: 'Suspended', inactive: 'Inactive' }

export function toApiStatus(value) {
  if (!value) return undefined
  const key = String(value).trim().toLowerCase()
  return API_STATUS[key] || String(value)
}

export function fromApiStatus(value) {
  return value ? String(value).trim().toLowerCase() : 'unknown'
}

// Response field names are not documented in the spec, so reads are tolerant of
// camelCase / snake_case / alternate names instead of assuming one spelling.
// Junk that earlier writes left in text fields (e.g. an object stringified
// into a string column). Treat it as absent rather than rendering it.
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

function formatDate(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const asObject = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})

function normalizeDocuments(raw) {
  const list = Array.isArray(raw?.documents) ? raw.documents : []
  return list
    .filter((doc) => doc && typeof doc === 'object')
    .map((doc, index) => ({
      id: String(pick(doc, ['_id', 'id', 'documentId']) || `doc-${index}`),
      type: pick(doc, ['documentType', 'type']) || '—',
      name: pick(doc, ['documentName', 'name', 'fileName']) || '—',
      url: pick(doc, ['documentUrl', 'url', 'fileUrl']) || '',
      issueDate: pick(doc, ['issueDate', 'issue_date']) || '',
      expiryDate: pick(doc, ['expiryDate', 'expiry_date', 'expiry']) || '',
      status: pick(doc, ['status']) || '—',
    }))
}

export function normalizeCompany(raw) {
  if (!raw || typeof raw !== 'object') return null

  // The company payload nests its details; read them tolerantly.
  const address = asObject(raw.address)
  const primaryContact = asObject(raw.primaryContact)
  const billing = asObject(raw.billing)
  const branding = asObject(raw.branding)

  // `_id` is the Mongo key the API expects for GET/PUT/status calls, while
  // `companyId` (e.g. CMP-001) is the human-readable code shown in the UI.
  const mongoId = pick(raw, ['_id', 'mongoId', 'id', 'company_id'])
  const companyId = pick(raw, ['companyId', 'company_id', 'companyCode', 'code'])
  const displayName = pick(raw, ['displayName', 'display_name', 'companyName', 'name'])
  const legalName = pick(raw, ['legalName', 'legal_name']) || displayName
  const createdAt = pick(raw, ['createdAt', 'created_at', 'createdDate', 'created'])

  const contactName = pick(raw, ['primaryContactName', 'primary_contact_name']) || pick(primaryContact, ['name'])
  const contactEmail = pick(raw, ['primaryContactEmail', 'primary_contact_email']) || pick(primaryContact, ['email'])
  const contactPhone = pick(raw, ['primaryContactPhone', 'primary_contact_phone']) || pick(primaryContact, ['phone'])

  const streetAddress = pick(raw, ['streetAddress', 'street_address']) || pick(address, ['streetAddress', 'street_address', 'street'])
  const city = pick(raw, ['city']) || pick(address, ['city'])
  const state = pick(raw, ['state']) || pick(address, ['state'])
  const zipCode = pick(raw, ['zipCode', 'zip_code', 'zip']) || pick(address, ['zipCode', 'zip_code', 'zip'])
  const country = pick(raw, ['country']) || pick(address, ['country'])
  const timezone = pick(raw, ['timezone']) || pick(address, ['timezone'])

  const brandColor = pick(raw, ['brandColor', 'brand_color']) || pick(branding, ['brandColor', 'brand_color']) || '#F15A26'
  const displayNameOverride =
    pick(raw, ['displayNameOverride', 'display_name_override']) || pick(branding, ['displayNameOverride', 'display_name_override']) || ''
  const logo = pick(branding, ['logo']) || pick(raw, ['logo']) || ''

  const billingContactName = pick(raw, ['billingContactName', 'billing_contact_name']) || pick(billing, ['contactName'])
  const billingEmail = pick(raw, ['billingEmail', 'billing_email']) || pick(billing, ['email'])
  const billingPhone = pick(raw, ['billingPhone', 'billing_phone']) || pick(billing, ['phone'])
  const billingAddress = pick(raw, ['billingAddress', 'billing_address']) || pick(billing, ['address'])

  const companyCode = pick(raw, ['companyCode', 'company_code', 'code'])

  return {
    id: mongoId ? String(mongoId) : '',
    mongoId: mongoId ? String(mongoId) : '',
    companyId: companyId ? String(companyId) : mongoId ? String(mongoId) : '—',
    name: displayName || legalName || '—',
    displayName: displayName || '—',
    legalName: legalName || '—',
    companyCode: companyCode || '—',
    registrationNumber: pick(raw, ['registrationNumber', 'registration_number', 'licenseNumber']) || '—',
    status: fromApiStatus(pick(raw, ['status'])),
    streetAddress: streetAddress || '—',
    city: city || '—',
    state: state || '—',
    zipCode: zipCode || '',
    country: country || '',
    timezone: timezone || '—',
    primaryContactName: contactName || '—',
    primaryContactEmail: contactEmail || '—',
    primaryContactPhone: contactPhone || '—',
    billingContactName: billingContactName || '—',
    billingEmail: billingEmail || '—',
    billingPhone: billingPhone || '—',
    billingAddress: billingAddress || '—',
    brandColor,
    displayNameOverride,
    logo,
    documents: normalizeDocuments(raw),
    plan: pick(raw, ['plan', 'platformPlan', 'subscriptionPlan']) || '—',
    drivers: Number(pick(raw, ['drivers', 'driverCount', 'driversCount']) ?? 0),
    createdAt: createdAt || null,
    created: formatDate(createdAt),
    // Aliases so the existing list columns keep working.
    contact: contactName || '—',
    phone: contactPhone || '—',
    email: contactEmail || '—',
  }
}

const LIST_KEYS = ['items', 'companies', 'rows', 'results', 'records', 'list', 'data']

export function normalizeCompanyList(data) {
  if (Array.isArray(data)) {
    return { items: data.map(normalizeCompany).filter(Boolean), total: data.length, page: 1, totalPages: 1 }
  }
  if (!data || typeof data !== 'object') {
    return { items: [], total: 0, page: 1, totalPages: 1 }
  }

  const listKey = LIST_KEYS.find((key) => Array.isArray(data[key]))
  if (!listKey) {
    // Fail loudly with the real keys so the response shape can be reported.
    throw new Error(`Unexpected companies response. Keys received: ${Object.keys(data).join(', ') || '(none)'}`)
  }

  const items = data[listKey].map(normalizeCompany).filter(Boolean)
  const total = Number(pick(data, ['total', 'totalCount', 'totalRecords', 'count']) ?? items.length)
  const limit = Number(pick(data, ['limit', 'perPage', 'pageSize']) ?? (items.length || 1))
  const page = Number(pick(data, ['page', 'currentPage', 'pageNumber']) ?? 1)
  const totalPages = Number(pick(data, ['totalPages', 'totalPage', 'pages', 'lastPage']) ?? Math.max(1, Math.ceil(total / (limit || 1))))

  return { items, total, page, limit, totalPages }
}

const TOKEN_KEYS = ['token', 'accessToken', 'access_token', 'jwt']

// POST /super-admin/login answers with the token nested inside the user object:
//   { statusCode: 200, data: { userData: { _id, name, email, role, token } } }
export async function login({ email, password }) {
  const data = await apiClient.post(`${BASE}/login`, { email, password })

  const rawUser = pick(data, ['userData', 'user', 'admin', 'superAdmin', 'profile'])
  const token = pick(rawUser, TOKEN_KEYS) || pick(data, TOKEN_KEYS) || pick(data?.tokens, TOKEN_KEYS)

  if (!token) {
    const topKeys = data && typeof data === 'object' ? Object.keys(data).join(', ') : typeof data
    const userKeys = rawUser && typeof rawUser === 'object' ? Object.keys(rawUser).join(', ') : '(none)'
    throw new Error(
      `Login succeeded but no token was found in the response. Top-level keys: ${topKeys || '(none)'}; user keys: ${userKeys}`
    )
  }

  const user = rawUser && typeof rawUser === 'object' ? { ...rawUser } : null
  // The token lives on the session; keep it out of the cached user object.
  if (user) delete user.token

  return { token, user }
}

export function listCompanies({ city, status, search, page, limit } = {}) {
  // "All Statuses" is the API's own sentinel for no status filter.
  const statusParam = !status || status === 'all' ? undefined : toApiStatus(status)
  return apiClient
    .get(`${BASE}/companies`, { city, status: statusParam, search, page, limit })
    .then(normalizeCompanyList)
}

export function getCompany(id) {
  return apiClient.get(`${BASE}/companies/${encodeURIComponent(id)}`).then((data) => normalizeCompany(data?.company || data))
}

export function updateCompanyStatus(id, status) {
  return apiClient.patch(`${BASE}/companies/status`, { id, status: toApiStatus(status) })
}

// POST /companies and PUT /companies are multipart/form-data. The update route
// has no {id} segment: the id is a body field and the DTO marks it required.
export function buildCompanyForm(values, { logo, documents } = {}) {
  const form = new FormData()
  const fields = {
    legalName: values.legalName,
    displayName: values.displayName,
    companyCode: values.companyCode,
    registrationNumber: values.registrationNumber,
    status: toApiStatus(values.status),
    streetAddress: values.streetAddress,
    city: values.city,
    state: values.state,
    zipCode: values.zipCode,
    country: values.country,
    timezone: values.timezone,
    primaryContactName: values.primaryContactName,
    primaryContactEmail: values.primaryContactEmail,
    primaryContactPhone: values.primaryContactPhone,
    billingContactName: values.billingContactName,
    billingEmail: values.billingEmail,
    billingPhone: values.billingPhone,
    billingAddress: values.billingAddress,
    brandColor: values.brandColor,
    displayNameOverride: values.displayNameOverride,
    documentType: values.documentType,
    documentName: values.documentName,
    issueDate: values.issueDate,
    expiryDate: values.expiryDate,
  }

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') continue
    form.append(key, String(value))
  }
  if (logo) form.append('logo', logo)
  for (const file of documents || []) form.append('documents', file)
  return form
}

export function createCompany(values, files) {
  return apiClient
    .postForm(`${BASE}/companies`, buildCompanyForm(values, files))
    .then((data) => normalizeCompany(data?.company || data))
}

export function updateCompany(id, values, files) {
  const form = buildCompanyForm(values, files)
  form.append('id', String(id))
  return apiClient
    .putForm(`${BASE}/companies`, form)
    .then((data) => normalizeCompany(data?.company || data))
}
