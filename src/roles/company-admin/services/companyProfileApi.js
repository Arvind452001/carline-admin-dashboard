import { apiClient } from '@/shared/services/apiClient'
import { companyIdCandidates } from '@/shared/utils/jwt'

// The company record lives on the Super Admin "companies" resource, and the API
// accepts a company-scoped token for the account's own entry. Verified live:
//   GET  /super-admin/companies/{id}   -> one company document (allowed)
//   GET  /super-admin/companies        -> 403 "Access forbidden" for a company token
//   PUT  /super-admin/companies        -> multipart; `id` REQUIRED in the body,
//                                         and there is no /companies/{id} PUT (404).
//
// The update route rebuilds the document from the body, so every field has to
// travel back on each save: omitting primaryContact{Name,Email,Phone}, city or
// state makes the API answer 500, and any omitted field is cleared.
const BASE = '/super-admin/companies'

function pick(source, keys) {
  if (!source || typeof source !== 'object') return undefined
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

const str = (value) => (value === undefined || value === null ? '' : String(value))

// The fields a Company Admin owns. Everything else on the document (status,
// company code, display name, billing) belongs to the Super Admin and is left
// alone - the API only writes the top-level scalars it receives.
export const COMPANY_FIELDS = [
  'legalName',
  'registrationNumber',
  'primaryContactName',
  'primaryContactEmail',
  'primaryContactPhone',
  'streetAddress',
  'city',
  'state',
  'zipCode',
  'country',
  'timezone',
  'brandColor',
  'displayNameOverride',
]

// Not editable here, but the API rebuilds the nested `billing` block from the
// request, so these have to travel back or the block is blanked on every save.
export const PRESERVE_FIELDS = ['billingContactName', 'billingEmail', 'billingPhone', 'billingAddress']

// The document nests address/contact/billing/branding; the form is flat.
export function normalizeCompanyProfile(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = pick(raw, ['_id', 'id'])
  if (!id) return null
  const address = raw.address || {}
  const contact = raw.primaryContact || {}
  const billing = raw.billing || {}
  const branding = raw.branding || {}
  return {
    id: str(id),
    legalName: str(pick(raw, ['legalName', 'companyName'])),
    displayName: str(raw.displayName),
    companyCode: str(raw.companyCode),
    registrationNumber: str(pick(raw, ['registrationNumber', 'license'])),
    status: str(raw.status),
    streetAddress: str(address.streetAddress ?? raw.streetAddress),
    city: str(address.city ?? raw.city),
    state: str(address.state ?? raw.state),
    zipCode: str(address.zipCode ?? raw.zipCode),
    country: str(address.country ?? raw.country),
    timezone: str(address.timezone ?? raw.timezone),
    primaryContactName: str(contact.name ?? raw.primaryContactName),
    primaryContactEmail: str(contact.email ?? raw.primaryContactEmail),
    primaryContactPhone: str(contact.phone ?? raw.primaryContactPhone),
    billingContactName: str(billing.contactName ?? raw.billingContactName),
    billingEmail: str(billing.email ?? raw.billingEmail),
    billingPhone: str(billing.phone ?? raw.billingPhone),
    billingAddress: str(billing.address ?? raw.billingAddress),
    brandColor: str(branding.brandColor ?? raw.brandColor),
    displayNameOverride: str(branding.displayNameOverride ?? raw.displayNameOverride),
    logo: str(branding.logo ?? raw.logo),
  }
}

// The form carries the flat API shape plus the logo URL for the preview.
export function profileToForm(profile) {
  if (!profile) return null
  return { ...profile, logoUrl: profile.logo || '' }
}

// Form values -> multipart body. `id` must ride along in the body.
export function buildCompanyForm(values, { logo } = {}) {
  const form = new FormData()
  form.append('id', str(values.id))
  for (const key of [...COMPANY_FIELDS, ...PRESERVE_FIELDS]) {
    const value = values[key]
    if (value === undefined || value === null || value === '') continue
    form.append(key, String(value))
  }
  if (logo) form.append('logo', logo)
  return form
}
export function getCompanyProfile(id) {
  return apiClient
    .get(`${BASE}/${encodeURIComponent(id)}`)
    .then((data) => normalizeCompanyProfile(data?.company || data))
}

export function listCompanies() {
  return apiClient.get(BASE).then((data) => {
    const rows = Array.isArray(data) ? data : pick(data, ['data', 'items', 'companies', 'rows', 'results'])
    return (Array.isArray(rows) ? rows : []).map(normalizeCompanyProfile).filter(Boolean)
  })
}

// Resolves the signed-in account's own company. Candidates are verified one by
// one against the API, so a hint that is not really a company id (a plain user's
// `id`, for instance) simply falls through. When nothing matches unambiguously
// nothing is guessed, so the panel can never write to the wrong company.
export async function resolveCompanyProfile(user, token) {
  for (const candidate of companyIdCandidates({ user, token })) {
    try {
      const profile = await getCompanyProfile(candidate)
      if (profile) return profile
    } catch {
      // Not a company id this token can read - try the next hint.
    }
  }

  // A company token is refused by the list route ("Access forbidden"), which is
  // correct - the id claims above are the intended way in. Only a Super Admin
  // reaches here with a usable list.
  let companies = []
  try {
    companies = await listCompanies()
  } catch {
    return null
  }
  if (companies.length === 1) return companies[0]

  const email = str(pick(user, ['email'])).toLowerCase()
  if (email) {
    const byEmail = companies.filter((company) => company.primaryContactEmail?.toLowerCase() === email)
    if (byEmail.length === 1) return byEmail[0]
  }

  return null
}

export function saveCompanyProfile(values, { logo } = {}) {
  if (!values?.id) throw new Error('Company id is missing, so the profile cannot be saved.')
  return apiClient
    .putForm(BASE, buildCompanyForm(values, { logo }))
    .then((data) => normalizeCompanyProfile(data?.company || data))
}