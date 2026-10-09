import { ALL_ROLES, ROLES } from './roles'

// Backend `UserRole` enum value -> admin-panel role slug.
//
// The panel uses kebab-case slugs as its single internal vocabulary: they are
// route segments (`/<slug>/<page>`), sidebar keys and permission keys. Backend
// role codes must be translated here before they reach the auth store, because
// the stored role is written straight into the URL.
export const BACKEND_ROLE_TO_SLUG = {
  SUPERADMIN: ROLES.SUPER_ADMIN,
  COMPANY_ADMIN: ROLES.COMPANY_ADMIN,
  DISPATCHER: ROLES.DISPATCHER,
  DRIVER_MANAGER: ROLES.DRIVER_MANAGER,
  CUSTOMER_SERVICE: ROLES.CUSTOMER_SERVICE,
  BILLING: ROLES.BILLING,
  ACCOUNTANT: ROLES.ACCOUNTING,
  MANAGER: ROLES.MANAGER,
  READ_ONLY: ROLES.READ_ONLY,
  REPORT_ONLY: ROLES.REPORT_ONLY,
}

// Valid backend roles that deliberately have no admin-panel equivalent. These
// accounts exist on the platform but must never reach the panel, so they get an
// explanatory message instead of a redirect loop.
export const NON_PANEL_ROLE_REASONS = {
  ADMIN: 'This admin role is not mapped to an admin panel role yet. Contact your platform administrator.',
  COMPANY_USER: 'Company user accounts do not have admin panel access.',
  DRIVER: 'Driver accounts cannot access the admin panel. Use the Carline Driver app.',
  USER: 'This is not an admin account and cannot access the admin panel.',
  PASSENGER: 'Passenger accounts cannot access the admin panel. Use the Carline rider app.',
}

const SLUG_TO_BACKEND_ROLE = Object.fromEntries(
  Object.entries(BACKEND_ROLE_TO_SLUG).map(([code, slug]) => [slug, code])
)

// Accepts a backend enum (`SUPERADMIN`, `ACCOUNTANT`, ...) or an already
// canonical panel slug (`super-admin`, `accounting`, ...) and returns the slug,
// or null when the value cannot be used by the panel.
export function normalizeRole(value) {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  if (ALL_ROLES.includes(raw)) return raw
  return BACKEND_ROLE_TO_SLUG[raw.toUpperCase()] ?? null
}

// Panel slug -> backend enum, for role values sent back to the API.
export function toBackendRole(slug) {
  if (!slug) return null
  return SLUG_TO_BACKEND_ROLE[String(slug).trim()] ?? null
}

// User-facing reason why a role cannot use the admin panel.
export function unsupportedRoleMessage(value) {
  const raw = value ? String(value).trim() : ''
  if (!raw) return 'Your account has no role assigned. Contact your platform administrator.'
  return (
    NON_PANEL_ROLE_REASONS[raw.toUpperCase()] ||
    `Role "${raw}" is not recognised by the admin panel. Contact your platform administrator.`
  )
}