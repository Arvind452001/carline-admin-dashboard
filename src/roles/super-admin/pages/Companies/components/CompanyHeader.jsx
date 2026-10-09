import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import { ArrowLeft, Edit2, ShieldAlert, CheckCircle } from 'lucide-react'

export default function CompanyHeader({
  companyRaw,
  companyStatus,
  toggleStatus,
  navigate,
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {companyRaw.logo ? (
          <img
            src={companyRaw.logo}
            alt={companyRaw.name}
            className="w-16 h-16 rounded-2xl bg-taxi-500/10 border border-border-strong object-contain"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-taxi-500/10 border border-border-strong flex items-center justify-center font-bold text-2xl text-taxi-500">
            {companyRaw.name.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary">{companyRaw.name}</h2>
            <StatusBadge status={companyStatus} />
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
            <span>Company ID: <span className="font-semibold text-text-secondary">{companyRaw.companyId}</span></span>
            <span className="text-border-subtle/80">|</span>
            <span>Platform Plan: <span className="font-semibold text-text-secondary">{companyRaw.plan}</span></span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-auto">
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/super-admin/companies')}>
          Back
        </Button>
        <Button icon={Edit2} onClick={() => navigate(`/super-admin/companies/${companyRaw.mongoId}/edit`)}>
          Edit Company
        </Button>
        <Button
          variant={companyStatus === 'active' ? 'danger' : 'success'}
          icon={companyStatus === 'active' ? ShieldAlert : CheckCircle}
          onClick={toggleStatus}
        >
          {companyStatus === 'active' ? 'Suspend Company' : 'Activate Company'}
        </Button>
      </div>
    </div>
  )
}
