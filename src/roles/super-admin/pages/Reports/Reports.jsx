import PageLayout from '@/layouts/PageLayout'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { kpiTrend } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'
import Select from '@/shared/components/Select'

const revenueByCompany = [
  { name: 'ABC Taxi', revenue: 62000 },
  { name: 'XYZ Taxi', revenue: 41000 },
  { name: 'City Cab', revenue: 98000 },
  { name: 'Metro Rides', revenue: 21000 },
]

export default function Reports() {
  return (
    <PageLayout
      title="Reports"
      description="Platform-wide revenue and trip trends."
      actions={
        <Select
          options={[
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: '90d', label: 'Last quarter' },
          ]}
          defaultValue="7d"
          className="!py-1.5"
        />
      }
    >
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="mb-4 font-display text-sm font-semibold text-text-primary">Revenue by company</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByCompany}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232838" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#a2a9bd', fontSize: 12 }} axisLine={{ stroke: '#232838' }} tickLine={false} />
              <YAxis tick={{ fill: '#a2a9bd', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#191d27', border: '1px solid #232838', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#f5b700" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {['Trip volume', 'Cancellation rate', 'Avg. fare'].map((label, i) => (
          <div key={label} className="rounded-xl border border-border-subtle bg-surface p-4">
            <p className="text-xs font-medium text-text-muted">{label}</p>
            <p className="mt-1 font-display text-lg font-semibold text-text-primary">
              {['6,940', '4.2%', currency(412)][i]}
            </p>
            <div className="mt-3 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiTrend(i * 5)}>
                  <Bar dataKey="value" fill="#f5b700" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
