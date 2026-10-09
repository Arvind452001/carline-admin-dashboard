import GenericListPage from '@/shared/components/GenericListPage'
import Badge from '@/shared/components/Badge'

const history = Array.from({ length: 12 }).map((_, i) => ({
  id: `RPT-${800 + i}`,
  name: ['Daily trip summary', 'Driver performance', 'Revenue by zone', 'Cancellation analysis'][i % 4],
  requestedBy: ['You', 'Ops team', 'Finance team'][i % 3],
  date: `${(i % 27) + 1} Aug 2026`,
  status: i % 6 === 0 ? 'failed' : 'ready',
}))

export default function ReportHistory() {
  return (
    <GenericListPage
      title="Report history"
      description="Every report generated, whether by you or scheduled automatically."
      rows={history}
      searchKeys={['name', 'id']}
      filterField="status"
      filterOptions={[
        { value: 'all', label: 'All' },
        { value: 'ready', label: 'Ready' },
        { value: 'failed', label: 'Failed' },
      ]}
      columns={[
        { key: 'id', label: 'Report ID' },
        { key: 'name', label: 'Report' },
        { key: 'requestedBy', label: 'Requested by' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'ready' ? 'green' : 'red'} dot>{r.status}</Badge> },
      ]}
    />
  )
}
