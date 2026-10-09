import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts'
import { kpiTrend } from '@/shared/utils/mockData'

export default function PerformanceChart({ seed = 5, color = '#f5b700' }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={kpiTrend(seed)}>
          <XAxis dataKey="day" tick={{ fill: '#a2a9bd', fontSize: 11 }} axisLine={{ stroke: '#232838' }} tickLine={false} />
          <Tooltip contentStyle={{ background: '#191d27', border: '1px solid #232838', borderRadius: 8, fontSize: 12 }} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
