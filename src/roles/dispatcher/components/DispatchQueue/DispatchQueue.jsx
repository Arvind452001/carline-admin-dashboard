import StatusBadge from '@/shared/components/StatusBadge'
import Badge from '@/shared/components/Badge'

export default function DispatchQueue({ trips, selectedId, onSelect }) {
  return (
    <div className="divide-y divide-border-subtle overflow-y-auto" style={{ maxHeight: 520 }}>
      {trips.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className={
            'flex w-full items-center justify-between px-3 py-3 text-left transition-colors ' +
            (selectedId === t.id ? 'bg-taxi-500/10' : 'hover:bg-surface-hover')
          }
        >
          <div>
            <p className="text-sm font-medium text-text-primary">{t.id}</p>
            <p className="mt-0.5 text-xs text-text-muted">{t.customer} · {t.pickup} → {t.dropoff}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={t.status} />
            <Badge tone="slate">{t.time}</Badge>
          </div>
        </button>
      ))}
    </div>
  )
}
