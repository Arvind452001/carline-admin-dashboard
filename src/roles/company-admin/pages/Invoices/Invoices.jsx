import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockInvoices } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function Invoices() {
  return (
    <GenericListPage
      title="Invoices"
      description="Platform commission invoices billed to your company."
      rows={mockInvoices}
      searchKeys={['id']}
      filterField="status"
      filterOptions={[
        { value: 'all', label: 'All' },
        { value: 'paid', label: 'Paid' },
        { value: 'due', label: 'Due' },
        { value: 'overdue', label: 'Overdue' },
      ]}
      columns={[
        { key: 'id', label: 'Invoice ID' },
        { key: 'amount', label: 'Amount', render: (r) => currency(r.amount) },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  )
}
