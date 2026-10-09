import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockTrips } from '@/shared/utils/mockData'

export default function ScheduledTrips() {
  const rows = mockTrips.filter((t) => t.status === 'scheduled')
  return (
    <GenericListPage
      title="Scheduled trips"
      description="Bookings scheduled for a future pickup time."
      rows={rows}
      searchKeys={['id', 'customer']}
      columns={[
        { key: 'id', label: 'Trip' },
        { key: 'customer', label: 'Customer' },
        { key: 'pickup', label: 'Pickup' },
        { key: 'time', label: 'Scheduled for' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  )
}
