import { Link } from 'react-router-dom'
import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import Button from '@/shared/components/Button'
import { mockDrivers } from '@/shared/utils/mockData'

export default function Drivers() {
  return (
    <GenericListPage
      title="Drivers"
      description="Every driver registered across the platform."
      rows={mockDrivers}
      searchKeys={['name', 'id', 'plate']}
      filterField="status"
      filterOptions={[
        { value: 'all', label: 'All' },
        { value: 'online', label: 'Online' },
        { value: 'offline', label: 'Offline' },
        { value: 'on-trip', label: 'On trip' },
        { value: 'suspended', label: 'Suspended' },
      ]}
      columns={[
        { key: 'name', label: 'Driver' },
        { key: 'vehicle', label: 'Vehicle' },
        { key: 'plate', label: 'Plate' },
        { key: 'rating', label: 'Rating' },
        { key: 'trips', label: 'Trips' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        {
          key: 'action',
          label: 'Action',
          render: (r) => (
            <Link to={`/super-admin/drivers/${r.id}`}>
              <Button size="sm" variant="secondary">
                View
              </Button>
            </Link>
          ),
        },
      ]}
    />
  )
}
