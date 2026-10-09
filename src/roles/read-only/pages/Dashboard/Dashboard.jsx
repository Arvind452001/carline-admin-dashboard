import PageLayout from '@/layouts/PageLayout'
import KpiCard from '@/shared/components/Kpi'
import Badge from '@/shared/components/Badge'
import { Eye } from 'lucide-react'
import { kpiTrend } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function Dashboard() {
  return (
    <PageLayout
      title="Overview"
      description="A read-only snapshot of company operations."
      actions={<Badge tone="slate"><Eye size={12} className="mr-1 inline" />View only</Badge>}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Trips today" value="486" trend={kpiTrend(4)} tone="taxi" />
        <KpiCard label="Drivers online" value="34" trend={kpiTrend(11)} tone="green" />
        <KpiCard label="Revenue today" value={currency(38400)} trend={kpiTrend(19)} tone="blue" />
        <KpiCard label="Cancellation rate" value="3.6%" trend={kpiTrend(6)} tone="red" />
      </div>
    </PageLayout>
  )
}
