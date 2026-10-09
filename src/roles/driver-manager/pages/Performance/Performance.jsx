import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import { mockDrivers } from '@/shared/utils/mockData'

export default function Performance() {
  return (
    <PageLayout title="Performance" description="Ratings and trip counts across your fleet.">
      <Table
        columns={[
          { key: 'name', label: 'Driver' },
          { key: 'rating', label: 'Rating', render: (r) => `★ ${r.rating}` },
          { key: 'trips', label: 'Trips completed' },
        ]}
        rows={mockDrivers}
      />
    </PageLayout>
  )
}
