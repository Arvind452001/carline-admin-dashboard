import GenericListPage from '@/shared/components/GenericListPage'
import { mockCustomers } from '@/shared/utils/mockData'

export default function Customers() {
  return (
    <GenericListPage
      title="Customers"
      description="View-only list of customers."
      rows={mockCustomers}
      searchKeys={['name']}
      columns={[
        { key: 'name', label: 'Customer' },
        { key: 'trips', label: 'Trips' },
        { key: 'lastTrip', label: 'Last trip' },
      ]}
    />
  )
}
