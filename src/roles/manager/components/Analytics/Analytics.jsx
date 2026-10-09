import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

const data = [
  { name: 'Completed', value: 76, color: '#2fd671' },
  { name: 'Cancelled', value: 9, color: '#ff5c5c' },
  { name: 'Ongoing', value: 15, color: '#4fb6ff' },
]

export default function AnalyticsPie() {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#191d27', border: '1px solid #232838', borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
