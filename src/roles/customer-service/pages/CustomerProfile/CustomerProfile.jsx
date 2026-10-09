import PageLayout from '@/layouts/PageLayout'
import CustomerProfileCard from '../../components/CustomerProfile'
import CustomerNotes from '../../components/CustomerNotes'
import { mockCustomers } from '@/shared/utils/mockData'

export default function CustomerProfile() {
  const customer = mockCustomers[0]
  return (
    <PageLayout title="Customer profile" description="Full record and support history.">
      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <CustomerProfileCard customer={customer} />
      </div>
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="mb-3 font-display text-sm font-semibold text-text-primary">Notes</h2>
        <CustomerNotes />
      </div>
    </PageLayout>
  )
}
