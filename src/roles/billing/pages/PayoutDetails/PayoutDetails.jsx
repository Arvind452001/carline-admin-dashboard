import PageLayout from '@/layouts/PageLayout'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockPayouts } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function PayoutDetails() {
  const payout = mockPayouts[0]
  return (
    <PageLayout title="Payout details" description="Full record for a single driver payout.">
      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-text-primary">{payout.id}</h2>
          <StatusBadge status={payout.status} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[['Driver', payout.driver], ['Amount', currency(payout.amount)], ['Date', payout.date]].map(([l, v]) => (
            <div key={l}><p className="text-xs text-text-muted">{l}</p><p className="mt-0.5 text-sm text-text-secondary">{v}</p></div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
