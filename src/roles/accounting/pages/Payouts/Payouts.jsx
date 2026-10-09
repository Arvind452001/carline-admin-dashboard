import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockPayouts } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function Payouts() {
  return (
    <GenericListPage
      title="Payouts"
      description="Driver payouts, for financial review."
      rows={mockPayouts}
      searchKeys={['id', 'driver']}
      columns={[
        { key: 'id', label: 'Payout ID' },
        { key: 'driver', label: 'Driver' },
        { key: 'amount', label: 'Amount', render: (r) => currency(r.amount) },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
      ]}
    />
  )
}
