import { Link } from 'react-router-dom'
import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import Button from '@/shared/components/Button'
import { mockCustomers } from '@/shared/utils/mockData'

export default function Customers() {
  return (
    <GenericListPage
      title="Customers"
      description="Riders across every company on the platform."
      rows={mockCustomers}
      searchKeys={['name', 'phone']}
      filterField="status"
      filterOptions={[
        { value: 'all', label: 'All' },
        { value: 'active', label: 'Active' },
        { value: 'restricted', label: 'Restricted' },
      ]}
      columns={[
        { key: 'name', label: 'Customer' },
        { key: 'phone', label: 'Phone' },
        { key: 'trips', label: 'Trips' },
        { key: 'lastTrip', label: 'Last trip' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
        {
          key: 'action',
          label: 'Action',
          render: (r) => (
            <Link to={`/super-admin/customers/${r.id}`}>
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
