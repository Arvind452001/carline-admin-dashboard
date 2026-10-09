import { apiClient, ApiError } from '@/shared/services/apiClient'

// Implements the Swagger "Pricing Engine" tag for the signed-in company:
//   GET    /pricing                    pricing configuration summary
//   GET    /pricing/fare-rules         read fare rules
//   POST   /pricing/fare-rules         create fare rules
//   PUT    /pricing/fare-rules         update fare rules
//   GET    /pricing/zone-rules         list zone rules
//   POST   /pricing/zone-rules         create a zone rule
//   PUT    /pricing/zone-rules         update a zone rule (id travels in the body)
//   DELETE /pricing/zone-rules         delete a zone rule (id travels in the body)
//   GET    /pricing/waiting-charges    read waiting charges
//   POST   /pricing/waiting-charges    create waiting charges
//   PUT    /pricing/waiting-charges    update waiting charges
//
// Every route is company-scoped. `companyId` is a query filter only a SuperAdmin
// needs, so it is appended when the signed-in account exposes one and otherwise
// left for the API to resolve from the Bearer token.
const BASE = '/pricing'

export const ZONE_STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

// A company that has never saved pricing gets HTTP 200 with success:false and
// "Pricing not configured yet", which apiClient surfaces as an ApiError. That is
// an expected state, not a transport failure: the page turns it into an empty
// form whose save action creates the record instead of updating it.
export function isNotConfigured(error) {
  if (!(error instanceof ApiError)) return false
  if (/not configured/i.test(error.message || '')) return true
  return error.status === 404
}

function pick(source, keys) {
  for (const key of keys) {
    const value = source?.[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function numOr(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function toNumber(value, label) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be a number.`)
  return parsed
}

function withCompanyId(payload, companyId) {
  return companyId ? { ...payload, companyId } : payload
}

// Response field names are not documented, so reads stay tolerant of camelCase
// and snake_case and of the object arriving either bare or under a wrapper key.
function unwrapKey(data, keys) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data
  for (const key of keys) {
    const inner = data[key]
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) return inner
  }
  return data
}

export function normalizeFareRules(data) {
  const raw = unwrapKey(data, ['fareRules', 'fareRule', 'pricing']) ?? {}
  return {
    baseFare: pick(raw, ['baseFare', 'base_fare']) ?? '',
    minimumFare: pick(raw, ['minimumFare', 'minimum_fare']) ?? '',
    perKmRate: pick(raw, ['perKmRate', 'per_km_rate', 'distanceRate']) ?? '',
    perMinuteRate: pick(raw, ['perMinuteRate', 'per_minute_rate', 'timeRate']) ?? '',
  }
}

export function normalizeWaitingCharges(data) {
  const raw = unwrapKey(data, ['waitingCharges', 'waitingCharge', 'pricing']) ?? {}
  return {
    gracePeriodMinutes: pick(raw, ['gracePeriodMinutes', 'grace_period_minutes', 'gracePeriod']) ?? '',
    waitingChargePerMinute: pick(raw, ['waitingChargePerMinute', 'waiting_charge_per_minute']) ?? '',
  }
}

export function normalizeZoneRule(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = pick(raw, ['id', '_id', 'zoneRuleId'])
  return {
    id: id ? String(id) : '',
    zoneName: String(pick(raw, ['zoneName', 'zone_name', 'name']) ?? ''),
    baseFareSurcharge: numOr(pick(raw, ['baseFareSurcharge', 'base_fare_surcharge'])),
    multiplier: numOr(pick(raw, ['multiplier']), 1),
    status: String(pick(raw, ['status']) ?? 'Active'),
  }
}

const LIST_KEYS = ['items', 'zones', 'zoneRules', 'rows', 'results', 'records', 'list', 'data']

export function normalizeZoneRuleList(data) {
  if (Array.isArray(data)) return data.map(normalizeZoneRule).filter(Boolean)
  if (!data || typeof data !== 'object') return []
  const key = LIST_KEYS.find((candidate) => Array.isArray(data[candidate]))
  if (!key) return []
  return data[key].map(normalizeZoneRule).filter(Boolean)
}

// Form state -> DTO field names.
export function buildFareRulesPayload(values) {
  return {
    baseFare: toNumber(values.baseFare, 'Base fare'),
    minimumFare: toNumber(values.minimumFare, 'Minimum fare'),
    perKmRate: toNumber(values.perKmRate, 'Per kilometre rate'),
    perMinuteRate: toNumber(values.perMinuteRate, 'Per minute rate'),
  }
}

export function buildWaitingChargesPayload(values) {
  return {
    gracePeriodMinutes: toNumber(values.gracePeriodMinutes, 'Grace period'),
    waitingChargePerMinute: toNumber(values.waitingChargePerMinute, 'Waiting charge per minute'),
  }
}

export function buildZoneRulePayload(values) {
  const zoneName = String(values.zoneName ?? '').trim()
  if (!zoneName) throw new Error('Zone name is required.')
  const payload = {
    zoneName,
    baseFareSurcharge: toNumber(values.baseFareSurcharge, 'Base fare surcharge'),
    multiplier: toNumber(values.multiplier, 'Multiplier'),
    status: values.status === 'Inactive' ? 'Inactive' : 'Active',
  }
  // UpdateZoneRuleDto requires the id; CreateZoneRuleDto must not receive one.
  if (values.id) payload.id = values.id
  return payload
}

export function getPricing(companyId) {
  return apiClient.get(BASE, { companyId })
}

export function getFareRules(companyId) {
  return apiClient.get(`${BASE}/fare-rules`, { companyId }).then(normalizeFareRules)
}

export function createFareRules(values, companyId) {
  return apiClient.post(`${BASE}/fare-rules`, withCompanyId(buildFareRulesPayload(values), companyId))
}

export function updateFareRules(values, companyId) {
  return apiClient.put(`${BASE}/fare-rules`, withCompanyId(buildFareRulesPayload(values), companyId))
}

export function listZoneRules(companyId) {
  return apiClient.get(`${BASE}/zone-rules`, { companyId }).then(normalizeZoneRuleList)
}

export function createZoneRule(values, companyId) {
  return apiClient.post(`${BASE}/zone-rules`, withCompanyId(buildZoneRulePayload(values), companyId))
}

export function updateZoneRule(values, companyId) {
  return apiClient.put(`${BASE}/zone-rules`, withCompanyId(buildZoneRulePayload(values), companyId))
}

export function deleteZoneRule(id, companyId) {
  if (!id) throw new Error('A zone rule id is required to delete it.')
  // The DTO carries the id in the body and the spec also exposes companyId as a
  // query filter, so both are sent.
  return apiClient.delete(`${BASE}/zone-rules`, withCompanyId({ id }, companyId), { companyId })
}

export function getWaitingCharges(companyId) {
  return apiClient.get(`${BASE}/waiting-charges`, { companyId }).then(normalizeWaitingCharges)
}

export function createWaitingCharges(values, companyId) {
  return apiClient.post(`${BASE}/waiting-charges`, withCompanyId(buildWaitingChargesPayload(values), companyId))
}

export function updateWaitingCharges(values, companyId) {
  return apiClient.put(`${BASE}/waiting-charges`, withCompanyId(buildWaitingChargesPayload(values), companyId))
}

// A "not configured yet" section resolves to empty values plus configured:false so
// the page can render the create flow; any other failure still propagates.
function section(load, fallback) {
  return load()
    .then((values) => ({ configured: true, values }))
    .catch((error) => {
      if (!isNotConfigured(error)) throw error
      return { configured: false, values: fallback }
    })
}

// Loads the three tabs in one pass.
export function loadPricingSettings(companyId) {
  return Promise.all([
    section(() => getFareRules(companyId), normalizeFareRules(null)),
    section(() => getWaitingCharges(companyId), normalizeWaitingCharges(null)),
    listZoneRules(companyId),
  ]).then(([fareRules, waitingCharges, zoneRules]) => ({ fareRules, waitingCharges, zoneRules }))
}

export { BASE as PRICING_BASE }
