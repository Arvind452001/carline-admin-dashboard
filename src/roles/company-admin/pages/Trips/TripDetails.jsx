import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, RefreshCw } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Badge from '@/shared/components/Badge'
import StatusBadge from '@/shared/components/StatusBadge'
import Button from '@/shared/components/Button'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import { formatDateTime } from '@/shared/utils/date'
import { currencyPrecise } from '@/shared/utils/currency'
import { titleCase } from '@/shared/utils/formatting'
import { getCompanyTrip } from '@/roles/company-admin/services/tripApi'

const DASH = '-'
const show = (value) => (value === undefined || value === null || value === '' ? DASH : value)
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value)

// Only the keys the API actually documents are listed, and each is skipped when
// the ride did not carry it.
const BREAKDOWN_MONEY = [
  ['basePrice', 'Base price'],
  ['distanceRate', 'Distance charge'],
  ['timeRate', 'Time charge'],
  ['perKmRate', 'Per km rate'],
  ['perMinuteRate', 'Per minute rate'],
  ['subTotal', 'Subtotal'],
  ['discount', 'Discount'],
  ['taxAndFees', 'Tax and fees'],
  ['totalFare', 'Total fare'],
  ['payableFare', 'Payable fare'],
]

const BREAKDOWN_PLAIN = [
  ['distanceKm', 'Distance (km)'],
  ['distanceMiles', 'Distance (mi)'],
  ['durationMinutes', 'Duration (min)'],
]

const TIMELINE = [
  ['createdAt', 'Booked'],
  ['driverAssignedAt', 'Driver assigned'],
  ['startedAt', 'Ride started'],
  ['completedAt', 'Completed'],
  ['cancelledAt', 'Cancelled'],
]

function Field({ label, children }) {
  return (
    <div>
      <span className="text-text-muted">{label}</span>
      <p className="mt-1 font-semibold text-text-primary">{children}</p>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">{title}</h3>
      {children}
    </div>
  )
}

export default function TripDetails() {
  const { tripId } = useParams()
  const navigate = useNavigate()

  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCompanyTrip(tripId)
      if (!data) throw new Error('Trip not found.')
      setTrip(data)
    } catch (err) {
      setTrip(null)
      setError(err.message || 'Could not load this trip.')
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const backAction = (
    <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/company-admin/trips')}>
      Back
    </Button>
  )

  if (loading) {
    return (
      <PageLayout title="Trip" actions={backAction}>
        <Loading label="Loading trip..." />
      </PageLayout>
    )
  }

  if (error || !trip) {
    return (
      <PageLayout title="Trip" actions={backAction}>
        <ErrorState title="Could not load this trip" description={error || 'Trip not found.'} onRetry={load} />
      </PageLayout>
    )
  }

  const actions = (
    <div className="flex gap-2">
      {backAction}
      <Button variant="secondary" icon={RefreshCw} onClick={load}>
        Refresh
      </Button>
    </div>
  )

  const breakdown = trip.fare.breakdown
  const moneyRows = breakdown ? BREAKDOWN_MONEY.filter(([key]) => isNumber(breakdown[key])) : []
  const plainRows = breakdown ? BREAKDOWN_PLAIN.filter(([key]) => isNumber(breakdown[key])) : []
  const timelineRows = TIMELINE.filter(([key]) => trip.timeline[key])

  return (
    <PageLayout title={trip.tripId} description="Trip details" actions={actions}>
      <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary">{trip.tripId}</h2>
            <StatusBadge status={trip.statusSlug} />
            <Badge tone="slate">{titleCase(trip.rideType)}</Badge>
          </div>
          <p className="text-xs text-text-muted">
            {trip.company?.name ? `${trip.company.name} - ` : ''}
            booked {trip.timeline.createdAt ? formatDateTime(trip.timeline.createdAt) : DASH}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border-subtle bg-surface p-2 px-4 text-center">
            <p className="text-[10px] font-bold uppercase text-text-muted">Payable</p>
            <p className="mt-0.5 text-sm font-black text-text-primary">{currencyPrecise(trip.fare.payableFare)}</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface p-2 px-4 text-center">
            <p className="text-[10px] font-bold uppercase text-text-muted">Distance</p>
            <p className="mt-0.5 text-sm font-black text-text-primary">{trip.distanceKm} km</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface p-2 px-4 text-center">
            <p className="text-[10px] font-bold uppercase text-text-muted">Duration</p>
            <p className="mt-0.5 text-sm font-black text-text-primary">{trip.durationMinutes} min</p>
          </div>
          <div className="rounded-xl border border-border-subtle bg-surface p-2 px-4 text-center">
            <p className="text-[10px] font-bold uppercase text-text-muted">Payment</p>
            <p className="mt-0.5 text-sm font-black text-text-primary">
              {titleCase(trip.fare.paymentMethod) || DASH}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Passenger">
          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            <Field label="Name">{show(trip.passenger.name)}</Field>
            <Field label="Phone">{show(trip.passenger.phone)}</Field>
            <Field label="Email">{show(trip.passenger.email)}</Field>
          </div>
        </Card>

        <Card title="Driver">
          {trip.driver ? (
            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <Field label="Name">{show(trip.driver.name)}</Field>
              <Field label="Phone">{show(trip.driver.phone)}</Field>
              <Field label="Vehicle">{show(trip.driver.vehicleType)}</Field>
              <Field label="Plate">{show(trip.driver.plate)}</Field>
              <Field label="Make">{show(trip.driver.make)}</Field>
              <Field label="Model & year">{show(trip.driver.modelAndYear)}</Field>
              <Field label="Rating">
                {trip.driver.rating === null ? DASH : `${trip.driver.rating} / 5`}
              </Field>
            </div>
          ) : (
            <p className="text-xs text-text-muted">No driver was assigned to this trip.</p>
          )}
        </Card>

        <Card title="Company">
          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            <Field label="Name">{show(trip.company?.name)}</Field>
            <Field label="Code">{show(trip.company?.code)}</Field>
            <Field label="Payment status">
              <StatusBadge status={trip.fare.paymentStatus} />
            </Field>
          </div>
        </Card>
      </div>

      <Card title="Route">
        <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
          <div className="flex gap-3">
            <MapPin size={16} className="mt-0.5 shrink-0 text-taxi-500" />
            <div>
              <p className="font-medium text-text-secondary">Pickup</p>
              <p className="mt-1 font-semibold text-text-primary">{show(trip.pickup.address)}</p>
              <p className="text-text-muted">
                {show(trip.pickup.latitude)}, {show(trip.pickup.longitude)}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin size={16} className="mt-0.5 shrink-0 text-signal-red" />
            <div>
              <p className="font-medium text-text-secondary">Drop-off</p>
              <p className="mt-1 font-semibold text-text-primary">{show(trip.dropoff.address)}</p>
              <p className="text-text-muted">
                {show(trip.dropoff.latitude)}, {show(trip.dropoff.longitude)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Fare">
        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
          <Field label="Payable fare">{currencyPrecise(trip.fare.payableFare)}</Field>
          <Field label="Total fare">{currencyPrecise(trip.fare.totalFare)}</Field>
          <Field label="Discount">{currencyPrecise(trip.fare.discount)}</Field>
          <Field label="Promo code">{show(trip.fare.promoCode)}</Field>
          <Field label="Payment method">{show(titleCase(trip.fare.paymentMethod))}</Field>
          <Field label="Payment status">
            <StatusBadge status={trip.fare.paymentStatus} />
          </Field>
        </div>

        {moneyRows.length > 0 || plainRows.length > 0 ? (
          <div className="rounded-xl border border-border-subtle">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-strong bg-surface-hover">
                  <th className="px-4 py-2 font-bold uppercase tracking-wider text-text-secondary">Component</th>
                  <th className="px-4 py-2 font-bold uppercase tracking-wider text-text-secondary">Value</th>
                </tr>
              </thead>
              <tbody>
                {moneyRows.map(([key, label]) => (
                  <tr key={key} className="border-b border-border-subtle/60 last:border-0">
                    <td className="px-4 py-2 text-text-secondary">{label}</td>
                    <td className="px-4 py-2 text-text-primary">{currencyPrecise(breakdown[key])}</td>
                  </tr>
                ))}
                {plainRows.map(([key, label]) => (
                  <tr key={key} className="border-b border-border-subtle/60 last:border-0">
                    <td className="px-4 py-2 text-text-secondary">{label}</td>
                    <td className="px-4 py-2 text-text-primary">{breakdown[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-text-muted">The API did not return a fare breakdown for this trip.</p>
        )}
      </Card>

      <Card title="Timeline">
        {timelineRows.length > 0 ? (
          <div className="space-y-3">
            {timelineRows.map(([key, label]) => (
              <div key={key} className="flex items-center gap-3 text-xs">
                <Clock size={14} className="shrink-0 text-text-muted" />
                <span className="w-32 text-text-secondary">{label}</span>
                <span className="font-semibold text-text-primary">{formatDateTime(trip.timeline[key])}</span>
              </div>
            ))}
            {trip.timeline.cancelReason && (
              <div className="rounded-lg border border-signal-red/20 bg-signal-red/5 px-3 py-2 text-xs text-text-secondary">
                <span className="font-semibold text-text-primary">Cancellation reason:</span>{' '}
                {trip.timeline.cancelReason}
                {trip.timeline.cancelledBy ? ` (by ${trip.timeline.cancelledBy})` : ''}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-text-muted">No timestamps on this trip yet.</p>
        )}

        {trip.scheduledAt && (
          <Field label="Scheduled for">{formatDateTime(trip.scheduledAt)}</Field>
        )}
        {trip.etaMinutes !== null && <Field label="ETA">{trip.etaMinutes} min</Field>}
      </Card>
    </PageLayout>
  )
}
