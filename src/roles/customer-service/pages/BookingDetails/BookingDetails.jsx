import PageLayout from '@/layouts/PageLayout'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockTrips } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function BookingDetails() {
  const trip = mockTrips[0]
  return (
    <PageLayout title="Booking details" description="Everything about a specific booking.">
      <div className="rounded-xl border border-border-subtle bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-text-primary">{trip.id}</h2>
          <StatusBadge status={trip.status} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[['Customer', trip.customer], ['Driver', trip.driver], ['Pickup', trip.pickup], ['Drop-off', trip.dropoff], ['Time', trip.time], ['Fare', currency(trip.fare)]].map(([l, v]) => (
            <div key={l}><p className="text-xs text-text-muted">{l}</p><p className="mt-0.5 text-sm text-text-secondary">{v}</p></div>
          ))}
        </div>
      </div>
    </PageLayout>
  )
}
