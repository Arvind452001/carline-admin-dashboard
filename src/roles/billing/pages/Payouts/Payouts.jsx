import PageLayout from '@/layouts/PageLayout'
import PayoutTable from '../../components/PayoutTable'
import { mockPayouts } from '@/shared/utils/mockData'

export default function Payouts() {
  return (
    <PageLayout title="Payouts" description="Payouts due or already processed to drivers.">
      <PayoutTable payouts={mockPayouts} />
    </PageLayout>
  )
}
