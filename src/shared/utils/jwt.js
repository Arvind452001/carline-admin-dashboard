// Reads a JWT payload without verifying the signature. The token is our own
// login response and its claims are only used to find which company the account
// belongs to; the server still authorises every request, so an unverified read
// here cannot grant access.
export function decodeJwtPayload(token) {
  if (typeof token !== 'string') return null
  const segment = token.split('.')[1]
  if (!segment) return null
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const binary = atob(padded)
    const json = decodeURIComponent(
      Array.from(binary, (char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    )
    const payload = JSON.parse(json)
    return payload && typeof payload === 'object' ? payload : null
  } catch {
    return null
  }
}

// A company login is the company document itself, so its `id` claim is the id
// the Super Admin company routes expect. These spellings have moved between
// backend revisions, so several are accepted.
const COMPANY_ID_CLAIMS = ['companyId', 'company_id', 'companyID', 'companyid']

function normalizeId(value) {
  if (typeof value === 'string' && value) return value
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object') return value.id || value._id || undefined
  return undefined
}

// Ordered, de-duplicated guesses for "which company is this account". The
// caller must still verify each one against the API, because `id` is the
// authenticated account and may be a plain user for a non-company role.
export function companyIdCandidates({ user, token } = {}) {
  const claims = decodeJwtPayload(token) || {}
  const candidates = []
  const push = (value) => {
    const id = normalizeId(value)
    if (id && !candidates.includes(id)) candidates.push(id)
  }

  for (const key of COMPANY_ID_CLAIMS) push(claims[key])
  push(claims.company)
  push(claims.id)
  push(user?.companyId)
  push(user?.company_id)
  push(user?.company)
  push(user?._id)
  push(user?.id)

  return candidates.slice(0, 4)
}