import { Send } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Badge from '@/shared/components/Badge'

const broadcasts = [
  { id: 1, title: 'Surge pricing active tonight', audience: 'All customers', sentAt: '2h ago', status: 'Sent' },
  { id: 2, title: 'New driver incentive program', audience: 'All drivers', sentAt: '1d ago', status: 'Sent' },
  { id: 3, title: 'Scheduled maintenance notice', audience: 'City Cab', sentAt: 'Draft', status: 'Draft' },
]

export default function Broadcasts() {
  return (
    <PageLayout title="Broadcasts" description="Mass messages sent to riders or drivers." actions={<Button icon={Send}>New broadcast</Button>}>
      <div className="space-y-3">
        {broadcasts.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface p-4">
            <div>
              <p className="text-sm font-medium text-text-primary">{b.title}</p>
              <p className="mt-1 text-xs text-text-muted">{b.audience} · {b.sentAt}</p>
            </div>
            <Badge tone={b.status === 'Sent' ? 'green' : 'slate'}>{b.status}</Badge>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
