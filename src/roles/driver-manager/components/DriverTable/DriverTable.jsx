import Table from '@/shared/components/Table'
import StatusBadge from '@/shared/components/StatusBadge'

export default function DriverTable({ drivers, extraColumns = [] }) {
  return (
    <Table
      columns={[
        { key: 'name', label: 'Driver' },
        { key: 'vehicle', label: 'Vehicle' },
        { key: 'plate', label: 'Plate' },
        { key: 'rating', label: 'Rating' },
        { key: 'trips', label: 'Trips' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        ...extraColumns,
      ]}
      rows={drivers}
    />
  )
}
