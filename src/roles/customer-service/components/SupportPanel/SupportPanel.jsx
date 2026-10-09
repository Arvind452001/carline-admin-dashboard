import Badge from '@/shared/components/Badge'

const tickets = [
  { id: 'TCK-101', subject: 'Driver was late by 20 minutes', status: 'open', priority: 'medium' },
  { id: 'TCK-102', subject: 'Charged twice for one trip', status: 'open', priority: 'high' },
  { id: 'TCK-103', subject: 'Lost umbrella in cab', status: 'resolved', priority: 'low' },
]

export default function SupportPanel() {
  return (
    <div className="space-y-2">
      {tickets.map((t) => (
        <div key={t.id} className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-text-primary">{t.subject}</p>
            <p className="mt-0.5 text-xs text-text-muted">{t.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'amber' : 'slate'}>{t.priority}</Badge>
            <Badge tone={t.status === 'open' ? 'blue' : 'green'} dot>{t.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
