import PageLayout from '@/layouts/PageLayout'
import KpiCard from '@/shared/components/Kpi'
import PaymentTable from '../../components/PaymentTable'
import { mockPayments, kpiTrend } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function Dashboard() {
  return (
    <PageLayout title="Billing overview" description="Payments and invoices at a glance.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Collected today" value={currency(48200)} delta={7.4} trend={kpiTrend(4)} tone="taxi" />
        <KpiCard label="Pending payments" value="8" delta={-3} trend={kpiTrend(9)} tone="amber" />
        <KpiCard label="Failed payments" value="2" delta={1} trend={kpiTrend(3)} tone="red" />
        <KpiCard label="Invoices due" value="3" delta={0} trend={kpiTrend(6)} tone="blue" />
      </div>
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Recent payments</h2>
        <PaymentTable payments={mockPayments.slice(0, 6)} />
      </div>
    </PageLayout>
  )
}
