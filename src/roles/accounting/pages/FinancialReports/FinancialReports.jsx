import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import { currency } from '@/shared/utils/currency'

const rows = [
  { id: 1, period: 'Aug 2026', revenue: 1840000, commission: 276000, payouts: 1420000, net: 144000 },
  { id: 2, period: 'Jul 2026', revenue: 1720000, commission: 258000, payouts: 1350000, net: 112000 },
  { id: 3, period: 'Jun 2026', revenue: 1605000, commission: 240750, payouts: 1260000, net: 104250 },
]

export default function FinancialReports() {
  return (
    <PageLayout title="Financial reports" description="Monthly revenue, commission and payout breakdown.">
      <Table
        columns={[
          { key: 'period', label: 'Period' },
          { key: 'revenue', label: 'Revenue', render: (r) => currency(r.revenue) },
          { key: 'commission', label: 'Commission', render: (r) => currency(r.commission) },
          { key: 'payouts', label: 'Payouts', render: (r) => currency(r.payouts) },
          { key: 'net', label: 'Net', render: (r) => currency(r.net) },
        ]}
        rows={rows}
      />
    </PageLayout>
  )
}
