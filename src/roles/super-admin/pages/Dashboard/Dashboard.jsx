import PageLayout from '@/layouts/PageLayout'
import KpiCard from '@/shared/components/Kpi'
import Table from '@/shared/components/Table'
import Badge from '@/shared/components/Badge'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockCompanies, mockAuditLogs, kpiTrend } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function Dashboard() {
  return (
    <PageLayout title="Platform overview" description="Everything happening across every company right now.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Companies onboarded" value={mockCompanies.length} delta={8} trend={kpiTrend(3)} tone="taxi" />
        <KpiCard label="Active drivers" value="1,284" delta={4.2} trend={kpiTrend(9)} tone="green" />
        <KpiCard label="Trips today" value="6,940" delta={-1.8} trend={kpiTrend(17)} tone="blue" />
        <KpiCard label="Platform revenue" value={currency(184000)} delta={12.4} trend={kpiTrend(23)} tone="taxi" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-border-subtle bg-surface overflow-hidden">
          <div className="p-4 pb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-text-primary">Companies</h2>
            <Badge tone="taxi">{mockCompanies.length} total</Badge>
          </div>
          <Table
            borderless
            columns={[
              { key: 'name', label: 'Company' },
              { key: 'city', label: 'City' },
              { key: 'drivers', label: 'Drivers' },
              { key: 'plan', label: 'Plan' },
              { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={mockCompanies}
          />
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Recent audit activity</h2>
          <ul className="space-y-3">
            {mockAuditLogs.slice(0, 6).map((log) => (
              <li key={log.id} className="text-sm">
                <p className="text-text-secondary">{log.action}</p>
                <p className="mt-0.5 text-xs text-text-muted">{log.actor} · {log.time}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageLayout>
  )
}
