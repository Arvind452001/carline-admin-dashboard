import PageLayout from '@/layouts/PageLayout'
import KpiCard from '@/shared/components/Kpi'
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'
import { kpiTrend } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function Dashboard() {
  return (
    <PageLayout title="Accounting overview" description="Revenue, commission and payouts at a glance.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Gross revenue (MTD)" value={currency(1840000)} delta={11.2} trend={kpiTrend(4)} tone="taxi" />
        <KpiCard label="Platform commission" value={currency(276000)} delta={9.8} trend={kpiTrend(9)} tone="blue" />
        <KpiCard label="Driver payouts (MTD)" value={currency(1420000)} delta={10.5} trend={kpiTrend(14)} tone="green" />
        <KpiCard label="Unreconciled entries" value="6" delta={-2} trend={kpiTrend(2)} tone="amber" />
      </div>
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="mb-4 font-display text-sm font-semibold text-text-primary">Revenue vs payouts (weekly)</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpiTrend(10)}>
              <XAxis dataKey="day" tick={{ fill: '#a2a9bd', fontSize: 12 }} axisLine={{ stroke: '#232838' }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#191d27', border: '1px solid #232838', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" fill="#f5b700" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageLayout>
  )
}
