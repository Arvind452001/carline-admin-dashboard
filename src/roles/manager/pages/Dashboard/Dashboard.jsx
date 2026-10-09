import PageLayout from '@/layouts/PageLayout'
import KpiCard from '@/shared/components/Kpi'
import PerformanceChart from '../../components/Performance'
import AnalyticsPie from '../../components/Analytics'
import { kpiTrend } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function Dashboard() {
  return (
    <PageLayout title="Operations overview" description="How the fleet performed today.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Trips today" value="500" delta={4.5} trend={kpiTrend(5)} tone="taxi" />
        <KpiCard label="Completed" value="450" delta={5.1} trend={kpiTrend(9)} tone="green" />
        <KpiCard label="Cancelled" value="20" delta={-1.2} trend={kpiTrend(3)} tone="red" />
        <KpiCard label="Revenue" value={currency(20000)} delta={8.9} trend={kpiTrend(14)} tone="blue" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="mb-2 font-display text-sm font-semibold text-text-primary">Trip volume trend</h2>
          <PerformanceChart seed={7} />
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="mb-2 font-display text-sm font-semibold text-text-primary">Trip outcome split</h2>
          <AnalyticsPie />
        </div>
      </div>
    </PageLayout>
  )
}
