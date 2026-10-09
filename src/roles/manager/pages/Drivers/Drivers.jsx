import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockDrivers } from '@/shared/utils/mockData'

export default function Drivers() {
  return (
    <GenericListPage
      title="Drivers"
      description="Driver-level performance and status."
      rows={mockDrivers}
      searchKeys={['name']}
      columns={[
        { key: 'name', label: 'Driver' },
        { key: 'rating', label: 'Rating' },
        { key: 'trips', label: 'Trips' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  )
}
