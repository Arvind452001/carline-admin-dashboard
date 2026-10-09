import PageLayout from '@/layouts/PageLayout'
import KpiCard from '@/shared/components/Kpi'
import SupportPanel from '../../components/SupportPanel'
import { kpiTrend } from '@/shared/utils/mockData'

export default function Dashboard() {
  return (
    <PageLayout title="Support overview" description="Open tickets and customer issues right now.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open tickets" value="12" delta={-4} trend={kpiTrend(6)} tone="amber" />
        <KpiCard label="Resolved today" value="27" delta={9.1} trend={kpiTrend(13)} tone="green" />
        <KpiCard label="Avg. response time" value="4m" delta={-11} trend={kpiTrend(2)} tone="blue" />
        <KpiCard label="Satisfaction score" value="4.7/5" delta={1.2} trend={kpiTrend(18)} tone="taxi" />
      </div>
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Recent tickets</h2>
        <SupportPanel />
      </div>
    </PageLayout>
  )
}
