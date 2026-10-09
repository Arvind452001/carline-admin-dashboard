import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-subtle py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-raised text-text-muted">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description && <p className="mt-1 max-w-xs text-xs text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
