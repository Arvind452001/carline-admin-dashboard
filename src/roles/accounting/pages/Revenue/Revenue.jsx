import PageLayout from '@/layouts/PageLayout'
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts'
import { kpiTrend } from '@/shared/utils/mockData'

export default function Revenue() {
  return (
    <PageLayout title="Revenue" description="Platform revenue trend over time.">
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={kpiTrend(16)}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5b700" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f5b700" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: '#a2a9bd', fontSize: 12 }} axisLine={{ stroke: '#232838' }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#191d27', border: '1px solid #232838', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#f5b700" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageLayout>
  )
}
