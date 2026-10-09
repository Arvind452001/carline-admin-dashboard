// Canonical role identifiers used across routing, permissions and the sidebar.
export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  COMPANY_ADMIN: 'company-admin',
  DISPATCHER: 'dispatcher',
  DRIVER_MANAGER: 'driver-manager',
  CUSTOMER_SERVICE: 'customer-service',
  BILLING: 'billing',
  ACCOUNTING: 'accounting',
  MANAGER: 'manager',
  READ_ONLY: 'read-only',
  REPORT_ONLY: 'report-only'
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.COMPANY_ADMIN]: 'Company Admin',
  [ROLES.DISPATCHER]: 'Dispatcher',
  [ROLES.DRIVER_MANAGER]: 'Driver Manager',
  [ROLES.CUSTOMER_SERVICE]: 'Customer Service',
  [ROLES.BILLING]: 'Billing',
  [ROLES.ACCOUNTING]: 'Accounting',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.READ_ONLY]: 'Read Only',
  [ROLES.REPORT_ONLY]: 'Report Only',
}

// One-line description of what each role is for — used on the login screen.
export const ROLE_DESCRIPTIONS = {
  [ROLES.SUPER_ADMIN]: 'Full platform control across every company',
  [ROLES.COMPANY_ADMIN]: 'Runs a single taxi company end-to-end',
  [ROLES.DISPATCHER]: 'Assigns drivers to bookings in real time',
  [ROLES.DRIVER_MANAGER]: 'Onboards, verifies and manages drivers',
  [ROLES.CUSTOMER_SERVICE]: 'Resolves customer issues and support tickets',
  [ROLES.BILLING]: 'Handles customer payments and invoices',
  [ROLES.ACCOUNTING]: 'Financial reports, reconciliation and payouts',
  [ROLES.MANAGER]: 'Monitors operational performance and reports',
  [ROLES.READ_ONLY]: 'View-only access, no edits or actions',
  [ROLES.REPORT_ONLY]: 'Access limited to reports and analytics',
}

export const ALL_ROLES = Object.values(ROLES)
