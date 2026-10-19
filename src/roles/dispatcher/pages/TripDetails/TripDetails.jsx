import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  Phone,
  Mail,
  User,
  Car,
  Star,
  MapPin,
  Navigation,
  Calendar,
  CreditCard,
  Building,
  UserCheck,
  ShieldAlert,
  Edit2,
  AlertCircle,
  RefreshCw,
  Plus,
  ExternalLink,
  CheckCircle2,
  Receipt,
  Route
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import { dispatcherApi, tripStatusSlug } from '../../services/dispatcherApi'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

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

function formatTime(isoStr) {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function TripDetails() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tripIdParam = searchParams.get('tripId') || searchParams.get('id')

  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [drivers, setDrivers] = useState([])

  // Notes
  const [notes, setNotes] = useState([
    { time: 'System', author: 'System', text: 'Trip booking registered in system.' }
  ])
  const [noteInput, setNoteInput] = useState('')

  // Edit/Modify Modal
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [modifyData, setModifyData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    notes: ''
  })

  // Assign Driver Modal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState('')

  // Cancel Modal
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation')

  const [submitting, setSubmitting] = useState(false)

  const driverOptions = useMemo(() => {
    const list = [...drivers]
    const hasArvind = list.some((d) => (d.id || d._id || d.driverId) === '6ab1196c8ded41326584d693')
    if (!hasArvind) {
      list.unshift({
        id: '6ab1196c8ded41326584d693',
        name: 'arvind',
        phone: '42354365475',
        vehicleType: 'SUV',
        vehicleRegistrationNumber: '23534543',
        plate: '23534543',
        status: 'Active'
      })
    }
    return list.map((d) => {
      const id = d.id || d._id || d.driverId
      const name = d.name || d.fullName || 'Driver'
      const vType = d.vehicleType || 'Standard'
      const reg = d.vehicleRegistrationNumber || d.plate ? ` • ${d.vehicleRegistrationNumber || d.plate}` : ''
      return {
        value: id,
        label: `${name} (${vType}${reg} • ${d.status || 'Active'})`
      }
    })
  }, [drivers])

  const openAssignModal = () => {
    if (!selectedDriverId) {
      const arvindDriver = drivers.find((d) => (d.id || d._id || d.driverId) === '6ab1196c8ded41326584d693')
      setSelectedDriverId(arvindDriver ? (arvindDriver.id || arvindDriver._id || arvindDriver.driverId) : '6ab1196c8ded41326584d693')
    }
    setShowAssignModal(true)
  }

  const fetchDetails = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true)
      setError('')
      let idToFetch = tripIdParam
      if (!idToFetch) {
        const list = await dispatcherApi.getTrips({ limit: 1 })
        if (list.trips && list.trips.length > 0) {
          idToFetch = list.trips[0].id
        }
      }

      if (idToFetch) {
        const detail = await dispatcherApi.getTripDetails(idToFetch)
        setTrip(detail)
        if (detail) {
          setModifyData({
            pickupAddress: detail.pickup?.address || '',
            dropoffAddress: detail.dropoff?.address || '',
            notes: detail.notes || ''
          })
          if (detail.notes) {
            setNotes((prev) => [
              ...prev,
              { time: 'Booking Notes', author: 'Dispatcher', text: detail.notes }
            ])
          }
        }
      } else {
        setError('No trip ID specified.')
      }

      // Fetch live drivers for assignment
      const mapRes = await dispatcherApi.getLiveMap()
      const rawDrivers = mapRes?.data?.drivers || mapRes?.drivers || []
      setDrivers(rawDrivers)
    } catch (err) {
      console.error('Error fetching trip details:', err)
      setError(err?.message || 'Failed to load trip details.')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [tripIdParam])

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const handleAddNote = (e) => {
    e.preventDefault()
    if (!noteInput.trim()) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setNotes((prev) => [
      ...prev,
      { time: timeStr, author: 'Dispatcher', text: noteInput.trim() }
    ])
    setNoteInput('')
  }

  const handleModifySubmit = async (e) => {
    e?.preventDefault()
    if (!trip) return
    try {
      setSubmitting(true)
      await dispatcherApi.modifyTrip(trip.id, {
        pickup: { address: modifyData.pickupAddress },
        dropoff: { address: modifyData.dropoffAddress },
        notes: modifyData.notes
      })
      setSuccessMsg('Trip details updated successfully.')
      setShowModifyModal(false)
      fetchDetails()
    } catch (err) {
      alert(err?.message || 'Failed to modify trip')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssignSubmit = async () => {
    if (!trip || !selectedDriverId) return
    try {
      setSubmitting(true)
      const res = await dispatcherApi.assignDriver(trip.id, selectedDriverId)

      const apiStatus = res?.data?.status || res?.status || 'REQUEST_SENT'
      const apiMessage = res?.message || res?.data?.message || 'Ride request sent to driver. Awaiting driver acceptance.'
      const driverData = res?.data?.driver || res?.driver || drivers.find((d) => (d.id || d._id || d.driverId) === selectedDriverId) || {
        id: selectedDriverId,
        name: selectedDriverId === '6ab1196c8ded41326584d693' ? 'arvind' : 'Assigned Driver',
        phone: selectedDriverId === '6ab1196c8ded41326584d693' ? '42354365475' : '',
        vehicleType: selectedDriverId === '6ab1196c8ded41326584d693' ? 'SUV' : '',
        vehicleRegistrationNumber: selectedDriverId === '6ab1196c8ded41326584d693' ? '23534543' : '',
        plate: selectedDriverId === '6ab1196c8ded41326584d693' ? '23534543' : '',
      }

      // Immediately reflect updated status and driver on screen
      setTrip((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          status: apiStatus,
          statusSlug: tripStatusSlug({ status: apiStatus }),
          rawStatus: apiStatus,
          driver: {
            ...(prev.driver || {}),
            id: driverData.id || driverData._id || selectedDriverId,
            name: driverData.name || driverData.fullName || prev.driver?.name || 'arvind',
            phone: driverData.phone || driverData.phoneNumber || prev.driver?.phone || '42354365475',
            vehicleType: driverData.vehicleType || prev.driver?.vehicleType || 'SUV',
            plate: driverData.vehicleRegistrationNumber || driverData.plate || prev.driver?.plate || '23534543',
            vehicleRegistrationNumber: driverData.vehicleRegistrationNumber || driverData.plate || '23534543',
          }
        }
      })

      setShowAssignModal(false)
      setSuccessMsg(apiMessage)

      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setNotes((prev) => [
        ...prev,
        { time: timeStr, author: 'System', text: apiMessage }
      ])

      // SweetAlert showing status and API message
      await Swal.fire({
        title: `Status: ${apiStatus}`,
        html: `
          <div style="text-align: left; font-size: 13px; line-height: 1.6; color: #334155;">
            <p style="font-weight: 600; font-size: 14px; color: #1e293b; margin-bottom: 10px;">${apiMessage}</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-top: 10px;">
              <p style="margin: 0; color: #64748b;"><strong>Current Status:</strong> <span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px;">${apiStatus}</span></p>
              <p style="margin: 6px 0 0; color: #334155;"><strong>Driver:</strong> ${driverData.name || 'arvind'}</p>
              ${driverData.phone ? `<p style="margin: 4px 0 0; color: #64748b;"><strong>Phone:</strong> ${driverData.phone}</p>` : ''}
              ${driverData.vehicleType ? `<p style="margin: 4px 0 0; color: #64748b;"><strong>Vehicle:</strong> ${driverData.vehicleType}</p>` : ''}
              ${(driverData.vehicleRegistrationNumber || driverData.plate) ? `<p style="margin: 4px 0 0; color: #64748b;"><strong>Registration:</strong> ${driverData.vehicleRegistrationNumber || driverData.plate}</p>` : ''}
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#e86f48',
        confirmButtonText: 'OK',
      })

      fetchDetails(true)
    } catch (err) {
      console.error('Failed to assign driver:', err)
      Swal.fire({
        title: 'Assignment Failed',
        text: err?.message || 'Failed to assign driver to this trip.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCheckStatus = async () => {
    if (!trip?.id) return
    try {
      setSubmitting(true)
      const detail = await dispatcherApi.getTripDetails(trip.id)
      if (detail) {
        setTrip(detail)
        const curStatus = detail.rawStatus || detail.status || 'UNKNOWN'
        const statusMessage = curStatus === 'REQUEST_SENT'
          ? `Ride request sent to driver ${detail.driver?.name || 'arvind'}. Awaiting driver acceptance.`
          : `Trip is currently in status: ${curStatus}`

        await Swal.fire({
          title: `Status: ${curStatus}`,
          html: `
            <div style="text-align: left; font-size: 13px; line-height: 1.6; color: #334155;">
              <p style="font-weight: 600; font-size: 14px; color: #1e293b; margin-bottom: 10px;">${statusMessage}</p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-top: 10px;">
                <p style="margin: 0; color: #64748b;"><strong>Trip ID:</strong> ${detail.tripId || trip.tripId}</p>
                <p style="margin: 6px 0 0; color: #64748b;"><strong>Current Status:</strong> <span style="background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px;">${curStatus}</span></p>
                ${detail.driver?.name ? `
                  <p style="margin: 6px 0 0; color: #334155;"><strong>Assigned Driver:</strong> ${detail.driver.name}</p>
                  ${detail.driver.phone ? `<p style="margin: 4px 0 0; color: #64748b;"><strong>Phone:</strong> ${detail.driver.phone}</p>` : ''}
                  ${detail.driver.vehicleType ? `<p style="margin: 4px 0 0; color: #64748b;"><strong>Vehicle:</strong> ${detail.driver.vehicleType} ${detail.driver.vehicleRegistrationNumber || detail.driver.plate ? `(${detail.driver.vehicleRegistrationNumber || detail.driver.plate})` : ''}</p>` : ''}
                ` : '<p style="margin: 6px 0 0; color: #94a3b8; font-style: italic;">No driver assigned yet.</p>'}
              </div>
            </div>
          `,
          icon: curStatus === 'REQUEST_SENT' ? 'info' : 'success',
          confirmButtonColor: '#e86f48',
          confirmButtonText: 'OK',
        })
      }
    } catch (err) {
      console.error('Error checking status:', err)
      Swal.fire({
        title: 'Error Checking Status',
        text: err?.message || 'Could not refresh trip status.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelSubmit = async () => {
    if (!trip) return
    try {
      setSubmitting(true)
      await dispatcherApi.cancelTrip(trip.id, cancelReason)
      setSuccessMsg('Trip cancelled successfully.')
      setShowCancelModal(false)
      fetchDetails()
    } catch (err) {
      alert(err?.message || 'Failed to cancel trip')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !trip) {
    return (
      <PageLayout title="Trip Details" description="Loading live trip details...">
        <div className="py-24 text-center text-xs text-text-muted">
          <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-taxi-500" />
          Loading trip data...
        </div>
      </PageLayout>
    )
  }

  const passenger = trip?.passenger || trip?.customer
  const driver = trip?.driver
  const breakdown = trip?.fare?.breakdown
  const timeline = trip?.timeline || {}

  const timelineSteps = [
    {
      label: 'Booking Created',
      done: !!timeline.createdAt || !!trip?.createdAt,
      time: formatTime(timeline.createdAt || trip?.createdAt),
      subtext: formatDate(timeline.createdAt || trip?.createdAt)
    },
    {
      label: (trip?.status === 'REQUEST_SENT' || trip?.rawStatus === 'REQUEST_SENT') ? 'Ride Request Sent' : 'Driver Assigned',
      done: !!timeline.driverAssignedAt || !!driver || trip?.status === 'REQUEST_SENT',
      time: formatTime(timeline.driverAssignedAt || timeline.requestSentAt || trip?.updatedAt),
      subtext: driver?.name
        ? ((trip?.status === 'REQUEST_SENT' || trip?.rawStatus === 'REQUEST_SENT')
            ? `Request sent to ${driver.name} (Awaiting acceptance)`
            : `Assigned to ${driver.name}`)
        : ''
    },
    {
      label: 'Trip Started',
      done: !!timeline.startedAt || trip?.statusSlug === 'ongoing' || trip?.statusSlug === 'completed',
      time: formatTime(timeline.startedAt),
      subtext: timeline.startedAt ? 'Driver on trip' : 'Awaiting start'
    },
    {
      label: 'Trip Completed',
      done: !!timeline.completedAt || trip?.statusSlug === 'completed',
      time: formatTime(timeline.completedAt),
      subtext: timeline.completedAt ? 'Dropoff verified' : 'Pending completion'
    }
  ]

  const pickupMapsUrl = trip?.pickup?.latitude && trip?.pickup?.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${trip.pickup.latitude},${trip.pickup.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip?.pickup?.address || '')}`

  const dropoffMapsUrl = trip?.dropoff?.latitude && trip?.dropoff?.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${trip.dropoff.latitude},${trip.dropoff.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip?.dropoff?.address || '')}`

  return (
    <PageLayout
      title={`Trip ${trip?.tripId || 'Details'}`}
      description={`Trip ID: ${trip?.id || ''}`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/dispatcher/dispatch-board')}>
            Back to Board
          </Button>
          <Button variant="secondary" icon={RefreshCw} onClick={fetchDetails}>
            Refresh
          </Button>
          <Button variant="secondary" icon={CheckCircle2} onClick={handleCheckStatus} disabled={submitting}>
            Check Status
          </Button>
          <Button variant="secondary" icon={Edit2} onClick={() => setShowModifyModal(true)}>
            Modify Details
          </Button>
          <Button variant="secondary" icon={UserCheck} onClick={openAssignModal}>
            {driver ? 'Reassign Driver' : 'Assign Driver'}
          </Button>
          <Button variant="danger" icon={ShieldAlert} onClick={() => setShowCancelModal(true)}>
            Cancel Trip
          </Button>
        </div>
      }
    >
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="font-bold">✕</button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {trip && (
        <div className="space-y-6">
          {/* Status Alert Banner when REQUEST_SENT */}
          {(trip.status === 'REQUEST_SENT' || trip.rawStatus === 'REQUEST_SENT') && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Status: REQUEST_SENT</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-800">
                      Awaiting Driver Acceptance
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Ride request sent to driver <strong>{trip.driver?.name || 'arvind'}</strong>. Awaiting driver acceptance.
                  </p>
                </div>
              </div>
              <Button size="xs" variant="secondary" icon={RefreshCw} onClick={handleCheckStatus} disabled={submitting}>
                Check Status
              </Button>
            </div>
          )}

          {/* Top Banner / Highlights Card */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div className="flex items-center gap-4">
                {trip.company?.logo ? (
                  <img
                    src={trip.company.logo}
                    alt={trip.company.name}
                    className="w-12 h-12 rounded-xl object-contain bg-white/5 border border-border-subtle p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-taxi-500/10 flex items-center justify-center text-taxi-500 font-bold">
                    <Building size={22} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-text-primary">{trip.tripId}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface border border-border-subtle text-text-muted">
                      {trip.rideType || 'INSTANT'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {trip.company?.name || 'Company'} {trip.company?.code ? `• ${trip.company.code}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] text-text-muted block">Current Status</span>
                  <StatusBadge status={trip.statusSlug || 'pending'} />
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div className="bg-surface p-3 rounded-xl border border-border-subtle">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Route size={14} className="text-taxi-500" /> Distance
                </span>
                <p className="font-bold text-text-primary mt-1 text-sm">
                  {trip.distanceKm ? `${trip.distanceKm} km` : '—'}
                  {breakdown?.distanceMiles ? ` (${breakdown.distanceMiles} mi)` : ''}
                </p>
              </div>

              <div className="bg-surface p-3 rounded-xl border border-border-subtle">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-500" /> Duration & ETA
                </span>
                <p className="font-bold text-text-primary mt-1 text-sm">
                  {trip.durationMinutes ? `${trip.durationMinutes} mins` : '—'}
                  {trip.etaMinutes && trip.etaMinutes !== trip.durationMinutes ? ` • ETA: ${trip.etaMinutes}m` : ''}
                </p>
              </div>

              <div className="bg-surface p-3 rounded-xl border border-border-subtle">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Calendar size={14} className="text-purple-500" /> Scheduled For
                </span>
                <p className="font-bold text-text-primary mt-1 text-sm">
                  {trip.scheduledAt ? formatDate(trip.scheduledAt) : 'Immediate (Now)'}
                </p>
              </div>

              <div className="bg-surface p-3 rounded-xl border border-border-subtle">
                <span className="text-text-muted flex items-center gap-1.5">
                  <CreditCard size={14} className="text-emerald-500" /> Total Fare
                </span>
                <p className="font-bold text-emerald-500 mt-1 text-sm">
                  ${trip.fare?.payableFare ?? trip.fare?.amount ?? 0}
                  <span className="text-[10px] text-text-muted font-normal ml-1">
                    ({trip.fare?.paymentMethod || 'CASH'})
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Main Grid: Details Left, Timeline & Notes Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: People, Route & Financial Breakdown */}
            <div className="lg:col-span-2 space-y-6">

              {/* 1. Passenger & Driver Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Passenger Card */}
                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                    <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wide">
                      <User size={14} className="text-taxi-500" /> Passenger Details
                    </h3>
                    <span className="text-[10px] bg-taxi-500/10 text-taxi-500 px-2 py-0.5 rounded font-semibold">
                      Rider
                    </span>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-10 h-10 rounded-full bg-taxi-500/10 border border-taxi-500/20 flex items-center justify-center text-taxi-500 font-bold text-sm shrink-0">
                      {passenger?.name ? passenger.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="space-y-1 text-xs flex-1">
                      <p className="font-bold text-text-primary text-sm">{passenger?.name || 'Customer'}</p>
                      
                      {passenger?.phone && (
                        <p className="text-text-secondary flex items-center gap-1.5">
                          <Phone size={12} className="text-text-muted" />
                          <a href={`tel:${passenger.phone}`} className="hover:text-taxi-500 transition-colors">
                            {passenger.phone}
                          </a>
                        </p>
                      )}

                      {passenger?.email && (
                        <p className="text-text-muted flex items-center gap-1.5 text-[11px]">
                          <Mail size={12} className="text-text-muted" />
                          <a href={`mailto:${passenger.email}`} className="hover:text-taxi-500 transition-colors">
                            {passenger.email}
                          </a>
                        </p>
                      )}

                      {passenger?.id && (
                        <p className="text-[10px] text-text-muted font-mono pt-1">
                          ID: {passenger.id}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Driver Card */}
                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                    <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5 uppercase tracking-wide">
                      <Car size={14} className="text-emerald-500" /> Assigned Driver
                    </h3>
                    <div className="flex items-center gap-2">
                      {(trip.status === 'REQUEST_SENT' || trip.rawStatus === 'REQUEST_SENT') && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-bold border border-amber-500/20 animate-pulse">
                          Awaiting Acceptance
                        </span>
                      )}
                      {driver?.rating && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                          <Star size={12} className="fill-amber-500 text-amber-500" /> {driver.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  {driver ? (
                    <div className="flex items-start gap-3 pt-1">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-sm shrink-0">
                        {driver.name ? driver.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div className="space-y-1 text-xs flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-text-primary text-sm">{driver.name}</p>
                          {(trip.status === 'REQUEST_SENT' || trip.rawStatus === 'REQUEST_SENT') && (
                            <span className="text-[10px] text-amber-600 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              REQUEST_SENT
                            </span>
                          )}
                        </div>
                        
                        {driver.phone && (
                          <p className="text-text-secondary flex items-center gap-1.5">
                            <Phone size={12} className="text-text-muted" />
                            <a href={`tel:${driver.phone}`} className="hover:text-emerald-500 transition-colors">
                              {driver.phone}
                            </a>
                          </p>
                        )}

                        {driver.email && (
                          <p className="text-text-muted flex items-center gap-1.5 text-[11px]">
                            <Mail size={12} className="text-text-muted" />
                            <a href={`mailto:${driver.email}`} className="hover:text-emerald-500 transition-colors">
                              {driver.email}
                            </a>
                          </p>
                        )}

                        <div className="pt-2 border-t border-border-subtle/40 text-[11px] space-y-0.5">
                          <p className="font-semibold text-text-primary">
                            {driver.vehicleType || 'Standard Vehicle'}
                            {(driver.vehicleRegistrationNumber || driver.plate) ? ` • Reg: ${driver.vehicleRegistrationNumber || driver.plate}` : ''}
                          </p>
                          {(driver.make || driver.modelAndYear) && (
                            <p className="text-text-muted capitalize">
                              {driver.make} {driver.modelAndYear ? `(${driver.modelAndYear})` : ''}
                            </p>
                          )}
                        </div>

                        {(trip.status === 'REQUEST_SENT' || trip.rawStatus === 'REQUEST_SENT') && (
                          <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 flex items-center gap-1.5">
                            <AlertCircle size={13} className="shrink-0 text-amber-600" />
                            <span>Ride request sent to driver {driver.name}. Awaiting driver acceptance.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-text-muted space-y-2">
                      <p>No driver assigned yet.</p>
                      <Button size="xs" icon={UserCheck} onClick={openAssignModal}>
                        Assign Driver Now
                      </Button>
                    </div>
                  )}
                </div>

              </div>

              {/* 2. Route & Location Details */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Navigation size={16} className="text-taxi-500" /> Route & Location Details
                  </h3>
                  <span className="text-xs text-text-muted">
                    {trip.distanceKm ? `${trip.distanceKm} km` : ''}
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Pickup */}
                  <div className="flex items-start gap-3 bg-surface p-3.5 rounded-xl border border-border-subtle">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={15} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wide">Pickup Location</span>
                        <a
                          href={pickupMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-taxi-500 hover:underline flex items-center gap-1"
                        >
                          View Map <ExternalLink size={10} />
                        </a>
                      </div>
                      <p className="font-medium text-text-primary text-sm mt-1">{trip.pickup?.address || 'Pickup Point'}</p>
                      {trip.pickup?.latitude && trip.pickup?.longitude && (
                        <p className="text-[10px] text-text-muted mt-0.5 font-mono">
                          Coordinates: {trip.pickup.latitude}, {trip.pickup.longitude}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dropoff */}
                  <div className="flex items-start gap-3 bg-surface p-3.5 rounded-xl border border-border-subtle">
                    <div className="w-7 h-7 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Navigation size={15} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-rose-500 tracking-wide">Dropoff Destination</span>
                        <a
                          href={dropoffMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-taxi-500 hover:underline flex items-center gap-1"
                        >
                          View Map <ExternalLink size={10} />
                        </a>
                      </div>
                      <p className="font-medium text-text-primary text-sm mt-1">{trip.dropoff?.address || 'Destination'}</p>
                      {trip.dropoff?.latitude && trip.dropoff?.longitude && (
                        <p className="text-[10px] text-text-muted mt-0.5 font-mono">
                          Coordinates: {trip.dropoff.latitude}, {trip.dropoff.longitude}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Fare & Financial Breakdown */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Receipt size={16} className="text-emerald-500" /> Fare & Financial Breakdown
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border-subtle font-mono text-[11px]">
                      {trip.fare?.paymentMethod || 'CASH'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      trip.fare?.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {trip.fare?.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                </div>

                <div className="bg-surface rounded-xl border border-border-subtle p-4 space-y-2.5 text-xs">
                  {breakdown ? (
                    <>
                      <div className="flex justify-between text-text-secondary">
                        <span>Base Fare</span>
                        <span className="font-medium text-text-primary">${breakdown.basePrice?.toFixed(2) || '0.00'}</span>
                      </div>

                      {breakdown.distanceRate > 0 && (
                        <div className="flex justify-between text-text-secondary">
                          <span>
                            Distance Rate ({breakdown.distanceKm || trip.distanceKm} km @ ${breakdown.perKmRate || 0}/km)
                          </span>
                          <span className="font-medium text-text-primary">${breakdown.distanceRate?.toFixed(2)}</span>
                        </div>
                      )}

                      {breakdown.timeRate > 0 && (
                        <div className="flex justify-between text-text-secondary">
                          <span>
                            Time Rate ({breakdown.durationMinutes || trip.durationMinutes} min @ ${breakdown.perMinuteRate || 0}/min)
                          </span>
                          <span className="font-medium text-text-primary">${breakdown.timeRate?.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-text-secondary pt-1 border-t border-border-subtle/50">
                        <span>Subtotal</span>
                        <span className="font-medium text-text-primary">${breakdown.subTotal?.toFixed(2) || '0.00'}</span>
                      </div>

                      {breakdown.discount > 0 && (
                        <div className="flex justify-between text-emerald-500">
                          <span>Discount</span>
                          <span>-${breakdown.discount?.toFixed(2)}</span>
                        </div>
                      )}

                      {breakdown.taxAndFees > 0 && (
                        <div className="flex justify-between text-text-secondary">
                          <span>Taxes & Fees</span>
                          <span className="font-medium text-text-primary">${breakdown.taxAndFees?.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  ) : null}

                  <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-border-subtle">
                    <span className="text-text-primary">Payable Total</span>
                    <span className="text-emerald-500 text-lg">
                      ${trip.fare?.payableFare ?? trip.fare?.totalFare ?? trip.fare?.amount ?? 0}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Timeline & Dispatcher Notes */}
            <div className="space-y-6">

              {/* Timeline Card */}
              <div className="glass-card rounded-2xl p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-border-subtle pb-2">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Clock size={16} className="text-taxi-500" /> Live Timeline
                  </h3>
                  <span className="text-[10px] text-text-muted">Lifecycle</span>
                </div>

                <div className="relative border-l-2 border-border-subtle ml-3 pl-5 space-y-6">
                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                        step.done
                          ? 'bg-taxi-500 border-taxi-500 shadow-sm shadow-taxi-500/50'
                          : 'bg-surface border-border-strong'
                      }`} />
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${step.done ? 'text-text-primary' : 'text-text-muted'}`}>
                            {step.label}
                          </span>
                          {step.time && (
                            <span className="text-[10px] text-taxi-500 font-mono font-semibold">{step.time}</span>
                          )}
                        </div>
                        {step.subtext && (
                          <p className="text-[10px] text-text-muted">{step.subtext}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {trip.cancelReason && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-signal-red space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldAlert size={14} /> Cancellation Details
                    </p>
                    <p>{trip.cancelReason}</p>
                    {trip.cancelledBy && <p className="text-[10px] text-text-muted">Cancelled by: {trip.cancelledBy}</p>}
                  </div>
                )}
              </div>

              {/* Dispatcher Notes Section */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">
                  Dispatcher Notes
                </h3>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add operational note..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    className="flex-1 rounded-xl border border-border-subtle bg-surface px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:border-taxi-500 focus:outline-none"
                  />
                  <Button type="submit" size="xs" icon={Plus}>Add</Button>
                </form>

                <div className="space-y-2.5 pt-1 max-h-64 overflow-y-auto">
                  {notes.map((n, idx) => (
                    <div key={idx} className="bg-surface p-3 rounded-xl border border-border-subtle space-y-1 text-xs">
                      <div className="flex justify-between items-center text-[10px] text-text-muted border-b border-border-subtle/50 pb-1">
                        <span className="font-bold text-text-primary">{n.author}</span>
                        <span>{n.time}</span>
                      </div>
                      <p className="text-text-secondary pt-0.5">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Modify Modal */}
      {showModifyModal && (
        <Modal
          open={showModifyModal}
          onClose={() => setShowModifyModal(false)}
          title={`Modify Trip ${trip?.tripId}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowModifyModal(false)}>Cancel</Button>
              <Button onClick={handleModifySubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Modifications'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Pickup Location Address"
              value={modifyData.pickupAddress}
              onChange={(e) => setModifyData((p) => ({ ...p, pickupAddress: e.target.value }))}
            />
            <Input
              label="Dropoff Location Address"
              value={modifyData.dropoffAddress}
              onChange={(e) => setModifyData((p) => ({ ...p, dropoffAddress: e.target.value }))}
            />
            <Input
              label="Notes / Instructions"
              value={modifyData.notes}
              onChange={(e) => setModifyData((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </Modal>
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <Modal
          open={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title={`Assign Driver for ${trip?.tripId}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
              <Button onClick={handleAssignSubmit} disabled={!selectedDriverId || submitting}>
                {submitting ? 'Assigning...' : 'Confirm Assignment'}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Select an available company driver from your active fleet to assign to this trip:
            </p>
            <Select
              label="Select Driver"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              options={[
                { value: '', label: '-- Choose a driver --' },
                ...driverOptions
              ]}
            />
          </div>
        </Modal>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <Modal
          open={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title={`Cancel Trip ${trip?.tripId}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowCancelModal(false)}>Keep Trip</Button>
              <Button variant="danger" onClick={handleCancelSubmit} disabled={submitting}>
                {submitting ? 'Cancelling...' : 'Confirm Cancel'}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Are you sure you want to cancel this booking? This will notify the passenger and free up any assigned driver.
            </p>
            <Input
              label="Reason for Cancellation"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Passenger no-show, Dispatcher override"
            />
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
