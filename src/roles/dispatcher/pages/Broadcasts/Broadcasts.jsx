import PageLayout from '@/layouts/PageLayout'
import Badge from '@/shared/components/Badge'

const broadcasts = [
  { id: 1, title: 'Surge pricing active tonight', audience: 'All riders', sentAt: '2h ago' },
]

export default function Broadcasts() {
  return (
    <PageLayout title="Broadcasts" description="Company-wide messages that may affect dispatching.">
      <div className="space-y-3">
        {broadcasts.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-4">
            <div>
              <p className="text-sm font-medium text-text-primary">{b.title}</p>
              <p className="mt-1 text-xs text-text-muted">{b.audience} · {b.sentAt}</p>
            </div>
            <Badge tone="green">Sent</Badge>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
