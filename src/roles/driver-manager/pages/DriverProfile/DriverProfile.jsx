import PageLayout from '@/layouts/PageLayout'
import VehicleDetails from '../../components/VehicleDetails'
import DriverDocuments from '../../components/DriverDocuments'
import DriverPerformance from '../../components/DriverPerformance'
import StatusBadge from '@/shared/components/StatusBadge'
import { initials } from '@/shared/utils/formatting'
import { mockDrivers } from '@/shared/utils/mockData'

export default function DriverProfile() {
  const driver = mockDrivers[0]
  return (
    <PageLayout title="Driver profile" description="Full record for a single driver.">
      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-taxi-500/15 font-display text-lg font-semibold text-taxi-400">
            {initials(driver.name)}
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-text-primary">{driver.name}</p>
            <div className="mt-1"><StatusBadge status={driver.status} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Vehicle</h2>
          <VehicleDetails driver={driver} />
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Documents</h2>
          <DriverDocuments />
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Performance</h2>
        <DriverPerformance driver={driver} />
      </div>
    </PageLayout>
  )
}
