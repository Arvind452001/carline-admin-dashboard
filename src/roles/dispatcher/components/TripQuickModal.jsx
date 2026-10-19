import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X, ExternalLink, User, Car, Phone, Mail, MapPin, Navigation,
  Clock, Calendar, Receipt, Copy, Check, Building, ShieldCheck,
  CreditCard, ArrowUpRight, Sparkles, UserCheck
} from 'lucide-react'
import Modal from '@/shared/components/Modal'
import Button from '@/shared/components/Button'

function formatDate(isoStr) {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return String(isoStr)
  }
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function TripQuickModal({ trip, open, isOpen, onClose, onAssignDriver }) {
  const navigate = useNavigate()
  const isModalOpen = open ?? isOpen
  const [copiedKey, setCopiedKey] = useState('')

  if (!isModalOpen || !trip) return null

  const handleCopy = (key, text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  // Normalized Fields
  const tripId = trip.tripId || trip.bookingCode || trip.id || 'TRP-UNKNOWN'
  const rawId = trip.id || trip._id || ''
  const status = (trip.status || trip.rawStatus || trip.statusSlug || 'PENDING').toUpperCase()

  const companyName = trip.company?.name || 'ABC Taxi'
  const companyCode = trip.company?.code || 'CMP-003'

  // Customer info
  const customerName = typeof trip.customer === 'string' ? trip.customer : (trip.customer?.name || 'Customer')
  const customerPhone = trip.customerPhone || trip.customer?.phone || ''
  const customerEmail = trip.customerEmail || trip.customer?.email || ''
  const customerId = trip.customerDetails?.id || trip.customer?.id || ''

  // Driver info
  const hasDriver = !!(trip.driver || trip.driverName)
  const driverName = typeof trip.driver === 'string' ? trip.driver : (trip.driver?.name || trip.driverName || '')
  const driverPhone = trip.driverPhone || trip.driver?.phone || ''
  const driverVehicle = trip.driverVehicle || trip.driver?.vehicleType || trip.vehicleType || 'Standard'
  const driverPlate = trip.driverPlate || trip.driver?.plate || trip.driver?.vehicleRegistrationNumber || ''
  const driverRating = trip.driver?.rating || null
  const driverId = trip.driver?.id || trip.driverId || ''

  // Route info
  const pickupAddress = (typeof trip.pickup === 'object' ? trip.pickup?.address : trip.pickup) || trip.pickupAddress || trip.source || 'Pickup location not specified'
  const destAddress = (typeof trip.dropoff === 'object' ? trip.dropoff?.address : (trip.dest || trip.dropoff)) || trip.destination || trip.dropAddress || 'Dropoff location not specified'
  
  const pickupLat = trip.pickupLat ?? trip.pickup?.latitude ?? trip.pickupCoords?.[0] ?? trip.pickupCoordinates?.lat
  const pickupLng = trip.pickupLng ?? trip.pickup?.longitude ?? trip.pickupCoords?.[1] ?? trip.pickupCoordinates?.lng
  const dropoffLat = trip.dropoffLat ?? trip.dropoff?.latitude ?? trip.dropoffCoords?.[0] ?? trip.dropoffCoordinates?.lat
  const dropoffLng = trip.dropoffLng ?? trip.dropoff?.longitude ?? trip.dropoffCoords?.[1] ?? trip.dropoffCoordinates?.lng

  const hasPickupCoords = typeof pickupLat === 'number' && typeof pickupLng === 'number' && pickupLat !== 0
  const hasDropoffCoords = typeof dropoffLat === 'number' && typeof dropoffLng === 'number' && dropoffLat !== 0

  // Fare info
  const displayFare = trip.fare?.displayFare || (typeof trip.fare === 'string' ? trip.fare : (trip.fare?.amount != null ? `$${trip.fare.amount}` : '$0.00'))
  const paymentMethod = trip.fare?.paymentMethod || trip.fareDetails?.paymentMethod || 'WALLET'
  const paymentStatus = trip.fare?.paymentStatus || trip.fareDetails?.paymentStatus || 'PENDING'
  const breakdown = trip.fareDetails?.breakdown || trip.fare?.breakdown

  // Dates
  const scheduledTime = trip.scheduledAt || trip.time
  const createdTime = trip.createdAt

  // Status Badge Colors
  const getStatusBadge = () => {
    switch (status) {
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/25">
            <Calendar size={12} />
            SCHEDULED
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            PENDING
          </span>
        )
      case 'ACCEPTED':
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/25">
            <Car size={12} />
            {status}
          </span>
        )
      case 'IN_TRANSIT':
      case 'ON_TRIP':
      case 'ARRIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/25">
            <Navigation size={12} />
            {status}
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
            <Check size={12} />
            COMPLETED
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/25">
            <X size={12} />
            CANCELLED
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-700 border border-slate-500/25">
            {status}
          </span>
        )
    }
  }

  return (
    <Modal
      open={true}
      isOpen={true}
      onClose={onClose}
      size="xl"
      title={`Trip Details: ${tripId}`}
      footer={
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-3">
          {/* Left: Raw Reference ID with copy */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="font-medium text-text-secondary">Ref ID:</span>
            <code className="bg-surface-raised px-2 py-1 rounded border border-border-subtle font-mono text-[11px] text-text-primary">
              {rawId || tripId}
            </code>
            <button
              type="button"
              onClick={() => handleCopy('dbId', rawId || tripId)}
              className="p-1 rounded hover:bg-surface-sunken text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Copy ID"
            >
              {copiedKey === 'dbId' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            </button>
            {copiedKey === 'dbId' && <span className="text-[11px] text-emerald-600 font-medium">Copied!</span>}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button variant="secondary" onClick={onClose} size="md">
              Close
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={ExternalLink}
              onClick={() => {
                onClose()
                navigate(`/dispatcher/trip-details?tripId=${rawId || tripId}`)
              }}
            >
              View Full Details
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4.5 text-xs">
        
        {/* Top Summary Banner */}
        <div className="bg-surface rounded-2xl p-4.5 border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold font-mono tracking-tight text-text-primary">
                {tripId}
              </h2>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-2 text-[12px] text-text-muted">
              <Building size={13} className="text-text-secondary" />
              <span>Company: <strong className="text-text-primary">{companyName}</strong> ({companyCode})</span>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-border-subtle/50">
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {displayFare}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                {paymentMethod}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                paymentStatus.toLowerCase() === 'paid' || paymentStatus.toLowerCase() === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Driver 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Customer / Passenger Card */}
          <div className="bg-surface rounded-2xl p-4 border border-border-subtle flex flex-col justify-between space-y-3.5 shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-taxi-600 flex items-center gap-1.5">
                  <User size={13} /> Passenger Details
                </span>
                {customerId && (
                  <span className="text-[10px] font-mono text-text-muted">
                    ID: {customerId.slice(0, 8)}...
                  </span>
                )}
              </div>

              <div className="flex items-start gap-3 mt-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-taxi-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {getInitials(customerName)}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-text-primary truncate">
                    {customerName}
                  </h4>

                  {customerPhone ? (
                    <div className="pt-0.5">
                      <a
                        href={`tel:${customerPhone}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                      >
                        <Phone size={12} />
                        {customerPhone}
                      </a>
                    </div>
                  ) : (
                    <span className="text-text-muted text-xs">No phone provided</span>
                  )}

                  {customerEmail && (
                    <div className="pt-1">
                      <a
                        href={`mailto:${customerEmail}`}
                        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary hover:underline truncate max-w-full"
                      >
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{customerEmail}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {customerId && (
              <div className="pt-2 border-t border-border-subtle/40 flex items-center justify-between text-[11px] text-text-muted font-mono">
                <span>Account ID: {customerId}</span>
                <button
                  type="button"
                  onClick={() => handleCopy('custId', customerId)}
                  className="p-1 hover:text-text-primary transition-colors cursor-pointer"
                  title="Copy Customer ID"
                >
                  {copiedKey === 'custId' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            )}
          </div>

          {/* Assigned Driver Card */}
          <div className="bg-surface rounded-2xl p-4 border border-border-subtle flex flex-col justify-between space-y-3.5 shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                  <Car size={13} /> Assigned Driver
                </span>
                {driverRating && (
                  <span className="text-amber-500 font-bold flex items-center gap-0.5 text-xs">
                    ★ {driverRating}
                  </span>
                )}
              </div>

              {hasDriver ? (
                <div className="flex items-start gap-3 mt-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {getInitials(driverName)}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-text-primary truncate">
                      {driverName}
                    </h4>

                    {driverPhone ? (
                      <div className="pt-0.5">
                        <a
                          href={`tel:${driverPhone}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                        >
                          <Phone size={12} />
                          {driverPhone}
                        </a>
                      </div>
                    ) : (
                      <span className="text-text-muted text-xs">No contact phone</span>
                    )}

                    <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-surface-raised border border-border-subtle text-[11px] font-medium text-text-secondary flex items-center gap-1">
                        <Car size={11} className="text-taxi-500" /> {driverVehicle}
                      </span>
                      {driverPlate && (
                        <span className="px-2 py-0.5 rounded-md bg-surface-raised border border-border-subtle text-[11px] font-mono font-semibold text-text-primary">
                          {driverPlate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-xs">No Driver Assigned</p>
                    <p className="text-text-muted text-[11px] mt-0.5">Awaiting manual dispatch or driver acceptance</p>
                  </div>
                  {onAssignDriver && (
                    <div className="pt-1">
                      <Button size="xs" variant="primary" onClick={() => onAssignDriver(trip)}>
                        Assign Driver Now
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {hasDriver && driverId && (
              <div className="pt-2 border-t border-border-subtle/40 flex items-center justify-between text-[11px] text-text-muted font-mono">
                <span>Driver ID: {driverId}</span>
                <button
                  type="button"
                  onClick={() => handleCopy('drvId', driverId)}
                  className="p-1 hover:text-text-primary transition-colors cursor-pointer"
                  title="Copy Driver ID"
                >
                  {copiedKey === 'drvId' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Route Details Card - Fixed & Elevated */}
        <div className="bg-surface rounded-2xl p-4.5 border border-border-subtle space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Navigation size={13} className="text-taxi-500" /> Route & Destinations
            </span>
            {(breakdown?.distanceKm || trip.distanceKm) && (
              <span className="px-2.5 py-0.5 rounded-full bg-surface-raised border border-border-subtle text-[11px] font-semibold text-text-primary">
                {breakdown?.distanceKm || trip.distanceKm} km {(breakdown?.durationMinutes || trip.durationMinutes || trip.etaMinutes) ? `• ~${breakdown?.durationMinutes || trip.durationMinutes || trip.etaMinutes} mins` : ''}
              </span>
            )}
          </div>

          <div className="relative pl-6 space-y-5">
            {/* Connecting Vertical Line */}
            <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-emerald-500 via-slate-300 to-rose-500" />

            {/* Pickup Point */}
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Pickup Location
                </span>
                <p className="text-sm font-semibold text-text-primary leading-snug">
                  {pickupAddress}
                </p>
                {hasPickupCoords && (
                  <div className="pt-1">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${pickupLat},${pickupLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-medium transition-colors"
                    >
                      <MapPin size={11} />
                      <span>View on Google Maps ({pickupLat.toFixed(4)}, {pickupLng.toFixed(4)})</span>
                      <ArrowUpRight size={11} className="opacity-70" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Dropoff Destination */}
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-rose-50 border-2 border-rose-500 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Dropoff Destination
                </span>
                <p className="text-sm font-semibold text-text-primary leading-snug">
                  {destAddress}
                </p>
                {hasDropoffCoords && (
                  <div className="pt-1">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${dropoffLat},${dropoffLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-medium transition-colors"
                    >
                      <Navigation size={11} />
                      <span>View on Google Maps ({dropoffLat.toFixed(4)}, {dropoffLng.toFixed(4)})</span>
                      <ArrowUpRight size={11} className="opacity-70" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fare Calculation Breakdown */}
        {breakdown && (
          <div className="bg-surface rounded-2xl p-4.5 border border-border-subtle space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <Receipt size={13} className="text-emerald-500" /> Fare Calculation & Breakdown
              </span>
              <span className="text-[11px] font-mono text-text-muted">Currency: USD</span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Base Booking Rate</span>
                <span className="font-semibold text-text-primary">${breakdown.basePrice}</span>
              </div>

              {breakdown.distanceRate > 0 && (
                <div className="flex justify-between text-text-secondary">
                  <span>Distance Fare ({breakdown.distanceKm} km @ ${breakdown.perKmRate}/km)</span>
                  <span className="font-semibold text-text-primary">${breakdown.distanceRate}</span>
                </div>
              )}

              {breakdown.timeRate > 0 && (
                <div className="flex justify-between text-text-secondary">
                  <span>Time Fare ({breakdown.durationMinutes} min @ ${breakdown.perMinuteRate}/min)</span>
                  <span className="font-semibold text-text-primary">${breakdown.timeRate}</span>
                </div>
              )}

              <div className="flex justify-between items-center font-bold text-text-primary pt-2.5 border-t border-border-subtle">
                <span className="text-sm">Payable Total</span>
                <span className="text-base font-extrabold text-emerald-600">
                  ${breakdown.payableFare || trip.fareDetails?.amount || displayFare}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps in Balanced 2-Card Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="bg-surface rounded-xl p-3.5 border border-border-subtle flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-center text-taxi-500 shrink-0">
              <Calendar size={16} />
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">
                Requested / Scheduled Time
              </span>
              <p className="font-bold text-text-primary text-xs mt-0.5">
                {formatDate(scheduledTime)}
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-3.5 border border-border-subtle flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border-subtle flex items-center justify-center text-text-muted shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase font-bold block">
                Booking Created
              </span>
              <p className="font-bold text-text-primary text-xs mt-0.5">
                {formatDate(createdTime)}
              </p>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  )
}
