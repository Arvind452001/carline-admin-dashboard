import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import { mockDrivers } from '@/shared/utils/mockData'

export default function Performance() {
  return (
    <PageLayout title="Performance" description="Team and driver performance overview.">
      <Table
        columns={[
          { key: 'name', label: 'Driver' },
          { key: 'rating', label: 'Rating', render: (r) => `★ ${r.rating}` },
          { key: 'trips', label: 'Trips' },
        ]}
        rows={mockDrivers}
      />
    </PageLayout>
  )
}
