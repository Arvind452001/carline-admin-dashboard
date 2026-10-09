import PageLayout from '@/layouts/PageLayout'
import PerformanceChart from '../../components/Performance'

export default function Reports() {
  return (
    <PageLayout title="Reports" description="Operational reports for your team.">
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="mb-2 font-display text-sm font-semibold text-text-primary">Weekly trip volume</h2>
        <PerformanceChart seed={11} color="#4fb6ff" />
      </div>
    </PageLayout>
  )
}
