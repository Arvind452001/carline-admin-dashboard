import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockPayments } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function Payments() {
  return (
    <GenericListPage
      title="Payments"
      description="Customer payments across every company."
      rows={mockPayments}
      searchKeys={['id', 'customer']}
      filterField="status"
      filterOptions={[
        { value: 'all', label: 'All' },
        { value: 'success', label: 'Success' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
      ]}
      columns={[
        { key: 'id', label: 'Payment ID' },
        { key: 'customer', label: 'Customer' },
        { key: 'amount', label: 'Amount', render: (r) => currency(r.amount) },
        { key: 'method', label: 'Method' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  )
}
