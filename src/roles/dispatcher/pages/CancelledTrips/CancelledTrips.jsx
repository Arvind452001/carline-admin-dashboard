import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockTrips } from '@/shared/utils/mockData'

export default function CancelledTrips() {
  const rows = mockTrips.filter((t) => t.status === 'cancelled')
  return (
    <GenericListPage
      title="Cancelled trips"
      description="Trips cancelled by the rider or driver."
      rows={rows}
      searchKeys={['id', 'customer']}
      columns={[
        { key: 'id', label: 'Trip' },
        { key: 'customer', label: 'Customer' },
        { key: 'pickup', label: 'Pickup' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  )
}
