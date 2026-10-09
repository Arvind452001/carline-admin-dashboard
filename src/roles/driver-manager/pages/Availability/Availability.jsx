import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import Badge from '@/shared/components/Badge'
import { mockDrivers } from '@/shared/utils/mockData'

export default function Availability() {
  return (
    <PageLayout title="Availability" description="Who's on shift right now.">
      <Table
        columns={[
          { key: 'name', label: 'Driver' },
          { key: 'status', label: 'Current status', render: (r) => <Badge tone={r.status === 'online' ? 'green' : r.status === 'on-trip' ? 'blue' : 'slate'} dot>{r.status}</Badge> },
          { key: 'shift', label: 'Shift', render: () => '9:00 AM – 9:00 PM' },
        ]}
        rows={mockDrivers}
      />
    </PageLayout>
  )
}
