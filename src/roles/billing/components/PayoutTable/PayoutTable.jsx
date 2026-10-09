import Table from '@/shared/components/Table'
import StatusBadge from '@/shared/components/StatusBadge'
import { currency } from '@/shared/utils/currency'

export default function PayoutTable({ payouts }) {
  return (
    <Table
      columns={[
        { key: 'id', label: 'Payout ID' },
        { key: 'driver', label: 'Driver' },
        { key: 'amount', label: 'Amount', render: (r) => currency(r.amount) },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
      rows={payouts}
    />
  )
}
