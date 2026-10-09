import { initials } from '@/shared/utils/formatting'
import StatusBadge from '@/shared/components/StatusBadge'

export default function CustomerProfileCard({ customer }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-taxi-500/15 font-display text-lg font-semibold text-taxi-400">
        {initials(customer.name)}
      </span>
      <div>
        <p className="font-display text-lg font-semibold text-text-primary">{customer.name}</p>
        <p className="text-xs text-text-muted">{customer.phone}</p>
        <div className="mt-1"><StatusBadge status={customer.status} /></div>
      </div>
    </div>
  )
}
