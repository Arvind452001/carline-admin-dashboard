import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import { mockDrivers } from '@/shared/utils/mockData'

export default function Vehicles() {
  return (
    <PageLayout title="Vehicles" description="Every vehicle registered on your fleet.">
      <Table
        columns={[
          { key: 'vehicle', label: 'Model' },
          { key: 'plate', label: 'Plate' },
          { key: 'name', label: 'Assigned driver' },
        ]}
        rows={mockDrivers}
      />
    </PageLayout>
  )
}
