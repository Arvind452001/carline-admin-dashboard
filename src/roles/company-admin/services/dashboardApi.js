import { apiClient } from '@/shared/services/apiClient'
import { titleCase } from '@/shared/utils/formatting'

// Implements the Swagger "Dashboard" tag:
//   GET /dashboard/overview?companyId&timeframe&startDate&endDate
//
// `companyId` is a SuperAdmin-only filter for viewing one company's metrics, so
// the panel only sends it when the signed-in account actually exposes one. A
// company user's own company is resolved by the API from the Bearer token.
const PATH = '/dashboard/overview'

export const TIMEFRAME_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom range' },
]

const TIMEFRAMES = TIMEFRAME_OPTIONS.map((option) => option.value)

// Chart tone per KPI card key, so the sparkline colour matches the metric.
const CARD_TONES = {
  tripsToday: 'taxi',
  driversOnline: 'green',
  revenueToday: 'blue',
  cancellationRate: 'red',
}
const DEFAULT_CARD_TONE = 'taxi'

const BREAKDOWN_LABELS = {
  completed: 'Completed',
  inProgress: 'In progress',
  searching: 'Searching',
  cancelled: 'Cancelled',
  scheduled: 'Scheduled',
}

// Backend trip states arrive as RIDE_* codes; the panel's badges use slugs.
const TRIP_STATUS_CODES = {
  RIDE_COMPLETED: 'completed',
  RIDE_CANCELLED: 'cancelled',
  RIDE_CANCELED: 'cancelled',
  RIDE_IN_PROGRESS: 'ongoing',
  RIDE_ONGOING: 'ongoing',
  RIDE_SEARCHING: 'pending',
  RIDE_PENDING: 'pending',
  RIDE_SCHEDULED: 'scheduled',
  RIDE_ASSIGNED: 'dispatched',
  RIDE_DISPATCHED: 'dispatched',
}

function numOr(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

// "↗ 12%" / "↘ 3.5%" -> 12 / 3.5
function percentValue(text) {
  const parsed = parseFloat(String(text ?? '').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

// KpiCard derives both the arrow and the colour from the sign, so the trend
// direction is folded into a single signed number.
function signedDelta(percentageChange, trendDirection, isPositive) {
  const magnitude = percentValue(percentageChange)
  const direction = String(trendDirection ?? '').trim().toUpperCase()
  if (direction === 'DOWN') return -magnitude
  if (direction === 'UP') return magnitude
  // NEUTRAL carries no direction, so `isPositive` decides how it is coloured.
  return isPositive === false ? -magnitude : magnitude
}

function toTrend(sparkline) {
  if (!Array.isArray(sparkline) || sparkline.length === 0) return undefined
  return sparkline.map((point) => ({ value: numOr(point) }))
}

function normalizeCard(raw, key) {
  if (!raw || typeof raw !== 'object') return null
  return {
    key,
    title: raw.title || titleCase(key),
    value: numOr(raw.value),
    displayValue: raw.displayValue ?? String(raw.value ?? '-'),
    delta: signedDelta(raw.percentageChange, raw.trendDirection, raw.isPositive),
    trend: toTrend(raw.sparkline),
    totalDrivers: raw.totalDrivers === undefined ? null : numOr(raw.totalDrivers),
    offlineDrivers: raw.offlineDrivers === undefined ? null : numOr(raw.offlineDrivers),
    cancelledCount: raw.cancelledCount === undefined ? null : numOr(raw.cancelledCount),
    tone: CARD_TONES[key] || DEFAULT_CARD_TONE,
  }
}

function normalizeTripStatus(code) {
  const upper = String(code ?? '').trim().toUpperCase()
  if (!upper) return 'pending'
  return TRIP_STATUS_CODES[upper] ?? upper.replace(/^RIDE_/, '').toLowerCase()
}

function normalizeTrip(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = raw.id ?? raw._id ?? raw.tripId
  if (!id) return null
  return {
    id: String(id),
    status: normalizeTripStatus(raw.status),
    vehicleType: raw.vehicleType || '-',
    pickup: raw.pickup || '-',
    dropoff: raw.dropoff || '-',
    fare: numOr(raw.fare),
    paymentMethod: raw.paymentMethod ? String(raw.paymentMethod) : '-',
    paymentStatus: raw.paymentStatus ? String(raw.paymentStatus).toLowerCase() : '',
    createdAt: raw.createdAt || '',
  }
}

function normalizeBreakdown(raw) {
  if (!raw || typeof raw !== 'object') return []
  return Object.entries(raw).map(([key, value]) => ({
    key,
    label: BREAKDOWN_LABELS[key] || titleCase(key),
    value: numOr(value),
  }))
}

// apiClient already unwraps the { statusCode, data, message, success } envelope,
// but a double-wrapped body is tolerated so the page never renders blank.
function unwrapOverview(raw) {
  if (raw && typeof raw === 'object' && (raw.cards || raw.recentTrips || raw.tripsBreakdown)) return raw
  if (raw?.data && typeof raw.data === 'object') return raw.data
  return raw ?? {}
}

function normalizeOverview(raw) {
  const payload = unwrapOverview(raw)
  const company = payload.company && typeof payload.company === 'object' ? payload.company : {}
  return {
    company: {
      name: company.name || 'Company',
      code: company.code || null,
      subtitle: company.subtitle || '',
    },
    timeframe: payload.timeframe || '',
    cards:
      payload.cards && typeof payload.cards === 'object'
        ? Object.entries(payload.cards)
            .map(([key, card]) => normalizeCard(card, key))
            .filter(Boolean)
        : [],
    breakdown: normalizeBreakdown(payload.tripsBreakdown),
    recentTrips: Array.isArray(payload.recentTrips)
      ? payload.recentTrips.map(normalizeTrip).filter(Boolean)
      : [],
  }
}

// Reads the company id from every shape the /auth/login payload may expose it in.
export function companyIdFromUser(user) {
  if (!user || typeof user !== 'object') return undefined
  const direct = user.companyId ?? user.company_id
  if (direct) return String(direct)
  const company = user.company
  if (company && typeof company === 'object') {
    const id = company.id ?? company._id
    if (id) return String(id)
  }
  return undefined
}

export function getDashboardOverview({ companyId, timeframe, startDate, endDate } = {}) {
  const range = String(timeframe ?? 'today').trim().toLowerCase()
  if (!TIMEFRAMES.includes(range)) {
    throw new Error(`Unsupported timeframe "${timeframe}". Use one of: ${TIMEFRAMES.join(', ')}.`)
  }
  // The start/end pair is only meaningful for the custom range, so a missing
  // pair is caught here instead of being sent as a half-formed request.
  if (range === 'custom' && (!startDate || !endDate)) {
    throw new Error('A custom timeframe needs both a start and an end date.')
  }

  return apiClient
    .get(PATH, {
      companyId,
      timeframe: range,
      startDate: range === 'custom' ? startDate : undefined,
      endDate: range === 'custom' ? endDate : undefined,
    })
    .then(normalizeOverview)
}

export { BREAKDOWN_LABELS }
