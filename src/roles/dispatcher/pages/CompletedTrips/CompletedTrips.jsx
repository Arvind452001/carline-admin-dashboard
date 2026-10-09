import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockTrips } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function CompletedTrips() {
  const rows = mockTrips.filter((t) => t.status === 'completed')
  return (
    <GenericListPage
      title="Completed trips"
      description="Trips finished today."
      rows={rows}
      searchKeys={['id', 'customer', 'driver']}
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
