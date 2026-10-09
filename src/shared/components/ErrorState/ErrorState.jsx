import { AlertTriangle } from 'lucide-react'
import Button from '@/shared/components/Button'

export default function ErrorState({ title = 'Something went wrong', description = 'Try again in a moment.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-signal-red/20 bg-signal-red/5 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-signal-red/10 text-signal-red">
        <AlertTriangle size={20} />
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="mt-1 max-w-xs text-xs text-text-muted">{description}</p>
      </div>
      {onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Retry</Button>}
    </div>
  )
}
