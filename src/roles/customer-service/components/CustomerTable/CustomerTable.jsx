import Table from '@/shared/components/Table'
import StatusBadge from '@/shared/components/StatusBadge'

export default function CustomerTable({ customers }) {
  return (
    <Table
      columns={[
        { key: 'name', label: 'Customer' },
        { key: 'phone', label: 'Phone' },
        { key: 'trips', label: 'Trips' },
        { key: 'lastTrip', label: 'Last trip' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
      rows={customers}
    />
  )
}
