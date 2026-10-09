import Table from '@/shared/components/Table'
import StatusBadge from '@/shared/components/StatusBadge'
import { currency } from '@/shared/utils/currency'

export default function PaymentTable({ payments }) {
  return (
    <Table
      columns={[
        { key: 'id', label: 'Payment ID' },
        { key: 'customer', label: 'Customer' },
        { key: 'amount', label: 'Amount', render: (r) => currency(r.amount) },
        { key: 'method', label: 'Method' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
      rows={payments}
    />
  )
}
