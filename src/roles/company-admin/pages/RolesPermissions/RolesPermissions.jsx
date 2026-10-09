import PageLayout from '@/layouts/PageLayout'
import Badge from '@/shared/components/Badge'
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/access/roles'
import { PERMISSIONS } from '@/access/permissions'

const companyRoles = ['dispatcher', 'driver-manager', 'customer-service', 'billing', 'accounting', 'manager', 'read-only', 'report-only']

export default function RolesPermissions() {
  return (
    <PageLayout title="Roles & Permissions" description="Roles available within your company.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {companyRoles.map((role) => (
          <div key={role} className="rounded-xl border border-border-subtle bg-surface p-4 flex flex-col justify-between">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-text-primary">{ROLE_LABELS[role]}</h3>
                <Badge tone="taxi">{(PERMISSIONS[role] || []).length} permissions</Badge>
              </div>
              <p className="mb-3 text-xs text-text-muted">{ROLE_DESCRIPTIONS[role]}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(PERMISSIONS[role] || []).map((p) => (
                <span key={p} className="rounded-md bg-surface-raised px-2 py-1 text-[11px] text-text-secondary border border-border-subtle">
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}

