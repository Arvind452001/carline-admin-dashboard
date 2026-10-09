import PageLayout from '@/layouts/PageLayout'
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'
import { kpiTrend } from '@/shared/utils/mockData'

export default function Analytics() {
  return (
    <PageLayout title="Analytics" description="Trend charts behind the generated reports.">
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpiTrend(13)}>
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
