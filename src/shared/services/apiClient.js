import { useAuthStore } from '@/store/authStore'
import { setCurrencySymbol } from '@/shared/utils/formatting'

// Carline API root. Override with VITE_API_BASE_URL (see .env.example).
// Swagger server is https://node.aitechnotech.in/carlinee and paths are /api/v1/*.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// Every response is wrapped as { statusCode, data, message, success }.
// Successful calls unwrap to `data`; failures become an ApiError.
function unwrap(payload, status) {
  const isEnvelope = payload && typeof payload === 'object' && !Array.isArray(payload) && 'success' in payload
  if (!isEnvelope) return payload
  if (!payload.success) {
    throw new ApiError(payload.message || `Request failed with status ${status}`, {
      status,
      data: payload.data,
    })
  }
  return payload.data
}

function buildQuery(params) {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.append(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

// Any response reporting a currency re-points the panel's formatter, so amounts
// always render in the backend's currency. A word-only value such as a currency
// code is ignored: only an actual symbol character is accepted.
function captureCurrency(...payloads) {
  for (const payload of payloads) {
    const symbol = payload?.currencySymbol ?? payload?.currency
    if (typeof symbol !== 'string') continue
    const trimmed = symbol.trim()
    if (!trimmed || /^[A-Za-z]{2,}$/.test(trimmed)) continue
    setCurrencySymbol(trimmed)
    return
  }
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = { Accept: 'application/json' }
  const token = useAuthStore.getState().token
  if (token) headers.Authorization = `Bearer ${token}`
  // Let the browser set the multipart boundary itself.
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(`Cannot reach the Carline API at ${BASE_URL}.`, { status: 0 })
  }

  const text = await res.text()
  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (res.status === 401) {
    useAuthStore.getState().logout()
    const raw = payload && payload.message
    throw new ApiError(raw || 'Your session has expired. Please sign in again.', { status: 401, data: payload })
  }

  if (!res.ok) {
    const raw = payload && payload.message
    // Nest validation failures return `message` as an array of strings.
    const message = Array.isArray(raw) ? raw.join(', ') : raw || `Request failed with status ${res.status}`
    throw new ApiError(message, { status: res.status, data: payload })
  }

  const data = unwrap(payload, res.status)
  captureCurrency(data, payload)
  return data
}

export const apiClient = {
  get: (path, params) => request(`${path}${buildQuery(params)}`),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  // `body` and `params` are optional: DELETE /pricing/zone-rules takes the id in
  // the body and the company filter in the query string.
  delete: (path, body, params) => request(`${path}${buildQuery(params)}`, { method: 'DELETE', body }),
  postForm: (path, form) => request(path, { method: 'POST', body: form, isForm: true }),
  putForm: (path, form) => request(path, { method: 'PUT', body: form, isForm: true }),
}

export { BASE_URL }

// Uploaded documents come back as storage keys such as "1789991276173-916447323.png",
// not as URLs. The backend has only ever emitted `${BASE_URL}/uploads/company/<name>`,
// so that folder is the default; point VITE_UPLOAD_BASE_URL elsewhere if it moves.
const UPLOAD_BASE_URL = (import.meta.env.VITE_UPLOAD_BASE_URL || `${BASE_URL}/uploads/company`).replace(/\/+$/, '')

const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i

export function isImageUpload(value) {
  return IMAGE_EXTENSION.test(String(value ?? '').split('?')[0].trim())
}

// Absolute URLs, data URIs and blob URLs are already resolved and pass through.
export function resolveUploadUrl(value) {
  const stored = String(value ?? '').trim()
  if (!stored) return ''
  if (/^(https?:|data:|blob:)/i.test(stored)) return stored
  return `${UPLOAD_BASE_URL}/${stored.replace(/^\/+/, '')}`
}
