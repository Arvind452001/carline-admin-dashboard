import Table from '@/shared/components/Table'
import StatusBadge from '@/shared/components/StatusBadge'
import { currency } from '@/shared/utils/currency'

export default function InvoiceTable({ invoices }) {
  return (
    <Table
      columns={[
        { key: 'id', label: 'Invoice ID' },
        { key: 'company', label: 'Company' },
        { key: 'amount', label: 'Amount', render: (r) => currency(r.amount) },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
      rows={invoices}
    />
  )
}
