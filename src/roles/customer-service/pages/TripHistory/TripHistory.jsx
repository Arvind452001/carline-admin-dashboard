import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockTrips } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function TripHistory() {
  return (
    <GenericListPage
      title="Trip history"
      description="Past trips, useful when investigating a complaint."
      rows={mockTrips}
      searchKeys={['id', 'customer']}
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
