import PageLayout from '@/layouts/PageLayout'
import KpiCard from '@/shared/components/Kpi'
import { kpiTrend } from '@/shared/utils/mockData'

export default function Analytics() {
  return (
    <PageLayout title="Analytics" description="Deeper operational metrics for your company.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Avg. trip duration" value="18 min" delta={-3.1} trend={kpiTrend(2)} tone="blue" />
        <KpiCard label="Driver utilization" value="72%" delta={5.4} trend={kpiTrend(14)} tone="green" />
        <KpiCard label="Repeat rider rate" value="61%" delta={1.9} trend={kpiTrend(21)} tone="taxi" />
      </div>
    </PageLayout>
  )
}
