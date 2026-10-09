import PageLayout from '@/layouts/PageLayout'
import Badge from '@/shared/components/Badge'
import { BrainCircuit } from 'lucide-react'

const models = [{ id: 1, name: 'ETA prediction', accuracy: '93.6%', status: 'live' }]

export default function AITraining() {
  return (
    <PageLayout title="AI Training" description="Models tuned for your company's operating area.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {models.map((m) => (
          <div key={m.id} className="rounded-xl border border-border-subtle bg-surface p-4">
            <div className="flex items-center justify-between">
              <BrainCircuit size={18} className="text-taxi-400" />
              <Badge tone="green">{m.status}</Badge>
            </div>
            <p className="mt-3 text-sm font-medium text-text-primary">{m.name}</p>
            <p className="mt-1 text-xs text-text-muted">Accuracy: {m.accuracy}</p>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
