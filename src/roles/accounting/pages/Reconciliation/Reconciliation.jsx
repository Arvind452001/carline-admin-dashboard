import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import Badge from '@/shared/components/Badge'
import { currency } from '@/shared/utils/currency'

const entries = Array.from({ length: 8 }).map((_, i) => ({
  id: `REC-${400 + i}`,
  description: ['Payment gateway settlement', 'Driver payout batch', 'Refund adjustment', 'Commission accrual'][i % 4],
  amount: 4000 + i * 350,
  status: i % 3 === 0 ? 'unmatched' : 'matched',
}))

export default function Reconciliation() {
  return (
    <PageLayout title="Reconciliation" description="Matching payment gateway records against internal ledgers.">
      <Table
        columns={[
          { key: 'id', label: 'Entry' },
          { key: 'description', label: 'Description' },
          { key: 'amount', label: 'Amount', render: (r) => currency(r.amount) },
          { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'matched' ? 'green' : 'amber'} dot>{r.status}</Badge> },
        ]}
        rows={entries}
      />
    </PageLayout>
  )
}
