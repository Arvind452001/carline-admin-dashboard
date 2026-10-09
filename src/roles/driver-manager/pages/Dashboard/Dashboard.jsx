import PageLayout from '@/layouts/PageLayout'
import KpiCard from '@/shared/components/Kpi'
import DriverTable from '../../components/DriverTable'
import { mockDrivers, kpiTrend } from '@/shared/utils/mockData'

export default function Dashboard() {
  return (
    <PageLayout title="Driver operations" description="Onboarding, verification and fleet health at a glance.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total drivers" value={mockDrivers.length} delta={5.2} trend={kpiTrend(5)} tone="taxi" />
        <KpiCard label="Pending verification" value="4" delta={-2} trend={kpiTrend(9)} tone="amber" />
        <KpiCard label="Online now" value={mockDrivers.filter((d) => d.status === 'online').length} delta={1.8} trend={kpiTrend(14)} tone="green" />
        <KpiCard label="Avg. rating" value="4.6" delta={0.4} trend={kpiTrend(2)} tone="blue" />
      </div>
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Recently active</h2>
        <DriverTable drivers={mockDrivers.slice(0, 6)} />
      </div>
    </PageLayout>
  )
}
