import Badge from '@/shared/components/Badge'
import Button from '@/shared/components/Button'
import { UserCheck } from 'lucide-react'

export default function DriverAssignment({ drivers, onAssign }) {
  const available = drivers.filter((d) => d.status === 'online')
  return (
    <div className="space-y-2">
      {available.map((d) => (
        <div key={d.id} className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-text-primary">{d.name}</p>
            <p className="mt-0.5 text-xs text-text-muted">{d.vehicle} · {d.plate} · ★ {d.rating}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="green" dot>Online</Badge>
            <Button size="sm" icon={UserCheck} onClick={() => onAssign?.(d)}>Assign</Button>
          </div>
        </div>
      ))}
    </div>
  )
}
