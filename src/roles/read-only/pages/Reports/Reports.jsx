import PageLayout from '@/layouts/PageLayout'
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts'
import { kpiTrend } from '@/shared/utils/mockData'

export default function Reports() {
  return (
    <PageLayout title="Reports" description="View-only report summaries.">
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kpiTrend(9)}>
              <XAxis dataKey="day" tick={{ fill: '#a2a9bd', fontSize: 12 }} axisLine={{ stroke: '#232838' }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#191d27', border: '1px solid #232838', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#f5b700" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageLayout>
  )
}
