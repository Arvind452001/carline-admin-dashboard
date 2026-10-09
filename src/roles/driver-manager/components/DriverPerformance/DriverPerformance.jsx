import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts'
import { kpiTrend } from '@/shared/utils/mockData'

export default function DriverPerformance({ driver }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <div><p className="text-xs text-text-muted">Rating</p><p className="mt-0.5 font-display text-lg font-semibold text-text-primary">★ {driver.rating}</p></div>
        <div><p className="text-xs text-text-muted">Trips completed</p><p className="mt-0.5 font-display text-lg font-semibold text-text-primary">{driver.trips}</p></div>
        <div><p className="text-xs text-text-muted">Acceptance rate</p><p className="mt-0.5 font-display text-lg font-semibold text-text-primary">92%</p></div>
      </div>
      <div className="mt-4 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={kpiTrend(8)}>
            <XAxis dataKey="day" tick={{ fill: '#a2a9bd', fontSize: 11 }} axisLine={{ stroke: '#232838' }} tickLine={false} />
            <Tooltip contentStyle={{ background: '#191d27', border: '1px solid #232838', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="value" stroke="#f5b700" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
