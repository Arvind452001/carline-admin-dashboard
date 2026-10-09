import PageLayout from '@/layouts/PageLayout'
import CustomerNotes from '../../components/CustomerNotes'

export default function Notes() {
  return (
    <PageLayout title="Notes" description="Internal notes left across all customer interactions.">
      <div className="max-w-2xl rounded-xl border border-border-subtle bg-surface p-4">
        <CustomerNotes />
      </div>
    </PageLayout>
  )
}
