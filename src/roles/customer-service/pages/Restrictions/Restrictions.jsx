import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockCustomers } from '@/shared/utils/mockData'

export default function Restrictions() {
  const rows = mockCustomers.filter((c) => c.status === 'restricted')
  return (
    <GenericListPage
      title="Restrictions"
      description="Customers flagged or restricted from booking."
      rows={rows}
      searchKeys={['name']}
      columns={[
        { key: 'name', label: 'Customer' },
        { key: 'phone', label: 'Phone' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  )
}
