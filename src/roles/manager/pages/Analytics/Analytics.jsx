import PageLayout from '@/layouts/PageLayout'
import AnalyticsPie from '../../components/Analytics'
import KpiCard from '@/shared/components/Kpi'
import { kpiTrend } from '@/shared/utils/mockData'

export default function Analytics() {
  return (
    <PageLayout title="Analytics" description="Deeper operational metrics.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="mb-2 font-display text-sm font-semibold text-text-primary">Trip outcomes</h2>
          <AnalyticsPie />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <KpiCard label="Driver utilization" value="72%" delta={5.4} trend={kpiTrend(14)} tone="green" />
          <KpiCard label="Repeat rider rate" value="61%" delta={1.9} trend={kpiTrend(21)} tone="taxi" />
        </div>
      </div>
    </PageLayout>
  )
}
