import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockCustomers } from '@/shared/utils/mockData'

export default function CustomerList() {
  return (
    <GenericListPage
      title="Customer list"
      description="Every rider you may need to support."
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
      ]}
    />
  )
}
