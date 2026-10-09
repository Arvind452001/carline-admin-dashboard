import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockPayments } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function Payments() {
  return (
    <GenericListPage
      title="Payments"
      description="View-only list of payments."
      rows={mockPayments}
      searchKeys={['id', 'customer']}
      columns={[
        { key: 'id', label: 'Payment ID' },
        { key: 'customer', label: 'Customer' },
        { key: 'amount', label: 'Amount', render: (r) => currency(r.amount) },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  )
}
