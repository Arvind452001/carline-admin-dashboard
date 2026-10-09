import PageLayout from '@/layouts/PageLayout'
import DriverDocuments from '../../components/DriverDocuments'

export default function Documents() {
  return (
    <PageLayout title="Documents" description="Verification status of driver paperwork.">
      <div className="max-w-lg rounded-xl border border-border-subtle bg-surface p-4">
        <DriverDocuments />
      </div>
    </PageLayout>
  )
}
