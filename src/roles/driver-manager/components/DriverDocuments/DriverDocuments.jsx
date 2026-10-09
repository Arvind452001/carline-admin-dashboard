import Badge from '@/shared/components/Badge'
import { FileText } from 'lucide-react'

const docs = [
  { name: 'Driving licence', status: 'verified' },
  { name: 'Vehicle registration (RC)', status: 'verified' },
  { name: 'Insurance', status: 'pending' },
  { name: 'Background check', status: 'verified' },
]

export default function DriverDocuments() {
  return (
    <div className="space-y-2">
      {docs.map((d) => (
        <div key={d.name} className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <FileText size={16} className="text-text-muted" />
            <p className="text-sm text-text-secondary">{d.name}</p>
          </div>
          <Badge tone={d.status === 'verified' ? 'green' : 'amber'} dot>{d.status}</Badge>
        </div>
      ))}
    </div>
  )
}
