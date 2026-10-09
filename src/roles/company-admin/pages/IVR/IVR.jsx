import PageLayout from '@/layouts/PageLayout'
import Badge from '@/shared/components/Badge'

const flows = [
  { id: 1, name: 'Book a ride (IVR)', calls: 340, tone: 'green' },
  { id: 2, name: 'Trip status check', calls: 210, tone: 'blue' },
]

export default function IVR() {
  return (
    <PageLayout title="IVR" description="Phone-based booking and support flows for your company.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {flows.map((f) => (
          <div key={f.id} className="rounded-xl border border-border-subtle bg-surface p-4">
            <Badge tone={f.tone}>{f.calls} calls / mo</Badge>
            <p className="mt-3 text-sm font-medium text-text-primary">{f.name}</p>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
