import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import Badge from '@/shared/components/Badge'

const areas = [
  { id: 1, name: 'City Core', drivers: 24, status: 'active' },
  { id: 2, name: 'Airport Corridor', drivers: 12, status: 'active' },
  { id: 3, name: 'Outer Ring', drivers: 18, status: 'active' },
  { id: 4, name: 'Industrial Belt', drivers: 3, status: 'inactive' },
]

export default function Areas() {
  return (
    <PageLayout title="Areas" description="Service areas your drivers are dispatched within.">
      <Table
        columns={[
          { key: 'name', label: 'Area' },
          { key: 'drivers', label: 'Drivers assigned' },
          { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'active' ? 'green' : 'slate'} dot>{r.status}</Badge> },
        ]}
        rows={areas}
      />
    </PageLayout>
  )
}
