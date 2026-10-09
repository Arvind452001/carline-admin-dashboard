import StatusBadge from '@/shared/components/StatusBadge'

function joinAddress(...parts) {
  const clean = parts.filter((part) => part && part !== '—')
  return clean.length ? clean.join(', ') : '—'
}

export default function OverviewTab({ companyRaw, companyStatus }) {
  const registeredAddress = joinAddress(
    companyRaw.streetAddress,
    companyRaw.city,
    companyRaw.state,
    companyRaw.zipCode,
    companyRaw.country
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Legal & Branding Info */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Legal & Branding</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-text-muted">Legal Name</p>
            <p className="font-medium text-text-primary mt-0.5">{companyRaw.legalName}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Company Code</p>
            <p className="font-medium text-text-primary mt-0.5">{companyRaw.companyCode}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">License / Registration</p>
            <p className="font-medium text-text-primary mt-0.5">{companyRaw.registrationNumber}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Brand Color</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: companyRaw.brandColor }} />
              <span className="font-medium text-text-primary">{companyRaw.brandColor}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-text-muted">Display Name Override</p>
            <p className="font-medium text-text-primary mt-0.5">{companyRaw.displayNameOverride || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Status</p>
            <div className="mt-0.5"><StatusBadge status={companyStatus} /></div>
          </div>
          <div>
            <p className="text-xs text-text-muted">Created Date</p>
            <p className="font-medium text-text-primary mt-0.5">{companyRaw.created}</p>
          </div>
        </div>
      </div>

      {/* Contact & Address */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Contact & Location</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-text-muted">Primary Contact</p>
            <p className="font-medium text-text-primary mt-0.5">{companyRaw.primaryContactName}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Email Address</p>
            <p className="font-medium text-text-primary mt-0.5 break-all">{companyRaw.primaryContactEmail}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Phone Number</p>
            <p className="font-medium text-text-primary mt-0.5">{companyRaw.primaryContactPhone}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Timezone</p>
            <p className="font-medium text-text-primary mt-0.5">{companyRaw.timezone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-text-muted">Registered Address</p>
            <p className="font-medium text-text-primary mt-0.5">{registeredAddress}</p>
          </div>
        </div>
      </div>

      {/* Billing Info */}
      <div className="glass-card rounded-2xl p-6 space-y-4 md:col-span-2">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-text-muted">Billing Contact</p>
            <p className="font-medium text-text-primary mt-0.5">{companyRaw.billingContactName}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Billing Email</p>
            <p className="font-medium text-text-primary mt-0.5 break-all">{companyRaw.billingEmail}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Billing Phone</p>
            <p className="font-medium text-text-primary mt-0.5">{companyRaw.billingPhone}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Billing Address</p>
            <p className="font-medium text-text-primary mt-0.5">{companyRaw.billingAddress}</p>
          </div>
        </div>
      </div>
    </div>
  )
}