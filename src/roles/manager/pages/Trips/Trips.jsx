import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockTrips } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function Trips() {
  return (
    <GenericListPage
      title="Trips"
      description="Trip-level detail behind the performance numbers."
      rows={mockTrips}
      searchKeys={['id', 'customer', 'driver']}
      filterField="status"
      filterOptions={[
        { value: 'all', label: 'All' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ]}
      columns={[
        { key: 'id', label: 'Trip' },
        { key: 'customer', label: 'Customer' },
        { key: 'driver', label: 'Driver' },
        { key: 'fare', label: 'Fare', render: (r) => currency(r.fare) },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  )
}
