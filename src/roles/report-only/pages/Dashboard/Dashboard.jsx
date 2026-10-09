import PageLayout from '@/layouts/PageLayout'
import KpiCard from '@/shared/components/Kpi'
import { kpiTrend } from '@/shared/utils/mockData'

export default function Dashboard() {
  return (
    <PageLayout title="Reports overview" description="Summary of the reports available to you.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Reports generated (MTD)" value="42" delta={6.2} trend={kpiTrend(4)} tone="taxi" />
        <KpiCard label="Scheduled reports" value="6" delta={0} trend={kpiTrend(9)} tone="blue" />
        <KpiCard label="Last export" value="2h ago" trend={kpiTrend(2)} tone="green" />
      </div>
    </PageLayout>
  )
}
