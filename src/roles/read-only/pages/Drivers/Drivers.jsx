import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockDrivers } from '@/shared/utils/mockData'

export default function Drivers() {
  return (
    <GenericListPage
      title="Drivers"
      description="View-only list of drivers."
      rows={mockDrivers}
      searchKeys={['name']}
      columns={[
        { key: 'name', label: 'Driver' },
        { key: 'vehicle', label: 'Vehicle' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  )
}
