import { ROLES } from './roles'

// Fine-grained capabilities. Pages/components call useHasPermission('trips.assign')
// rather than checking role strings directly, so permissions can be redefined
// per-company later without touching UI code.
export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.COMPANY_ADMIN]: [
    'company.manage', 'users.manage', 'roles.manage', 'trips.view', 'trips.manage',
    'drivers.view', 'drivers.manage', 'customers.view', 'customers.manage',
    'pricing.manage', 'areas.manage', 'payments.view', 'payouts.view', 'invoices.view',
    'reports.view', 'analytics.view', 'broadcasts.manage', 'notifications.manage',
    'ivr.manage', 'sms.manage', 'ai.manage', 'settings.manage', 'audit.view',
  ],
  [ROLES.DISPATCHER]: [
    'trips.view', 'trips.dispatch', 'trips.assign', 'bookings.create',
    'customers.view', 'notifications.view', 'broadcasts.view',
  ],
  [ROLES.DRIVER_MANAGER]: [
    'drivers.view', 'drivers.manage', 'drivers.verify', 'vehicles.manage', 'documents.manage',
  ],
  [ROLES.CUSTOMER_SERVICE]: [
    'customers.view', 'customers.manage', 'trips.view', 'bookings.view', 'support.manage',
  ],
  [ROLES.BILLING]: [
    'payments.view', 'payments.manage', 'payouts.view', 'invoices.view', 'invoices.manage',
  ],
  [ROLES.ACCOUNTING]: [
    'reports.financial', 'reconciliation.manage', 'payments.view', 'payouts.view', 'revenue.view',
  ],
  [ROLES.MANAGER]: [
    'trips.view', 'drivers.view', 'customers.view', 'reports.view', 'analytics.view', 'performance.view',
  ],
  [ROLES.READ_ONLY]: [
    'trips.view', 'drivers.view', 'customers.view', 'payments.view', 'reports.view',
  ],
  [ROLES.REPORT_ONLY]: [
    'reports.view', 'analytics.view',
  ],
}

export function roleHasPermission(role, permission) {
  const grants = PERMISSIONS[role] || []
  return grants.includes('*') || grants.includes(permission)
}
