import { useState } from 'react'
import {
  Send,
  AlertCircle,
  CheckCircle2,
  Car,
  MapPin,
  UserCheck,
  Play,
  CheckCircle,
  XCircle,
  MessageSquare,
  BellRing
} from 'lucide-react'
import Modal from '@/shared/components/Modal'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import { NOTIFICATION_TYPES } from '@/shared/utils/notificationUtils'
import { useNotificationStore } from '@/store/notificationStore'

const PRESETS = [
  {
    id: 'driver_arrived',
    label: 'Driver Arrived',
    icon: MapPin,
    type: NOTIFICATION_TYPES.DRIVER_ARRIVED,
    title: 'Driver Arrived',
    body: 'Driver Arvind has arrived at pickup. Share OTP: 2186 to start trip.',
    otp: '2186',
    rideId: '6acce08c76baad27250d94c0',
  },
  {
    id: 'driver_assigned',
    label: 'Driver Assigned',
    icon: UserCheck,
    type: NOTIFICATION_TYPES.DRIVER_ASSIGNED,
    title: 'Driver Assigned',
    body: 'Driver Rajesh (Toyota Prius • KA01AB1234) has been assigned to your ride.',
    otp: '',
    rideId: '6acce08c76baad27250d94c0',
  },
  {
    id: 'ride_booked',
    label: 'Ride Booked',
    icon: Car,
    type: NOTIFICATION_TYPES.RIDE_BOOKED,
    title: 'Ride Confirmed',
    body: 'Your ride from Central Station has been confirmed. Finding nearby drivers...',
    otp: '',
    rideId: '6acce08c76baad27250d94c0',
  },
  {
    id: 'trip_started',
    label: 'Trip Started',
    icon: Play,
    type: NOTIFICATION_TYPES.TRIP_STARTED,
    title: 'Trip Started',
    body: 'Your ride to Airport Terminal 3 has started. Have a safe journey!',
    otp: '',
    rideId: '6acce08c76baad27250d94c0',
  },
  {
    id: 'trip_completed',
    label: 'Trip Completed',
    icon: CheckCircle,
    type: NOTIFICATION_TYPES.TRIP_COMPLETED,
    title: 'Trip Completed',
    body: 'Trip completed successfully! Total Fare: $32.50. Receipt sent to rider.',
    otp: '',
    rideId: '6acce08c76baad27250d94c0',
  },
  {
    id: 'ride_cancelled',
    label: 'Ride Cancelled',
    icon: XCircle,
    type: NOTIFICATION_TYPES.RIDE_CANCELLED,
    title: 'Ride Cancelled',
    body: 'The ride was cancelled by the passenger. Reason: Changed plans.',
    otp: '',
    rideId: '6acce08c76baad27250d94c0',
  },
  {
    id: 'chat_message',
    label: 'Chat Message',
    icon: MessageSquare,
    type: NOTIFICATION_TYPES.CHAT_MESSAGE,
    title: 'New Message from Driver',
    body: 'I am waiting near the main entrance pillar #4.',
    otp: '',
    rideId: '6acce08c76baad27250d94c0',
  },
  {
    id: 'ride_request',
    label: 'New Ride Request',
    icon: BellRing,
    type: NOTIFICATION_TYPES.RIDE_REQUEST,
    title: 'New Ride Request',
    body: 'Pickup: 45 Ocean Drive • Fare: $28.00. 30 seconds to accept!',
    otp: '',
    rideId: '6acce08c76baad27250d94c0',
  },
]

export default function TestNotificationModal({ open, onClose }) {
  const sendTestNotification = useNotificationStore((s) => s.sendTestNotification)

  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].id)
  const [title, setTitle] = useState(PRESETS[0].title)
  const [body, setBody] = useState(PRESETS[0].body)
  const [type, setType] = useState(PRESETS[0].type)
  const [otp, setOtp] = useState(PRESETS[0].otp)
  const [rideId, setRideId] = useState(PRESETS[0].rideId)

  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function handleSelectPreset(preset) {
    setSelectedPreset(preset.id)
    setTitle(preset.title)
    setBody(preset.body)
    setType(preset.type)
    setOtp(preset.otp)
    setRideId(preset.rideId)
    setSuccessMsg('')
    setErrorMsg('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setErrorMsg('Please enter a notification title.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const payload = {
      title: title.trim(),
      body: body.trim(),
      type: type || NOTIFICATION_TYPES.TEST_PUSH,
      data: {
        type: type || NOTIFICATION_TYPES.TEST_PUSH,
        ...(rideId ? { rideId: rideId.trim() } : {}),
        ...(otp ? { otp: otp.trim() } : {}),
        sentAt: new Date().toISOString(),
      },
    }

    try {
      await sendTestNotification(payload)
      setSuccessMsg('Test notification sent successfully! Check the list and toast.')
      setTimeout(() => {
        onClose()
      }, 1400)
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to trigger test notification.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Send Real Test Notification" size="lg">
      <div className="space-y-4">
        <p className="text-xs text-text-muted">
          Trigger live test notifications through Swagger endpoint{' '}
          <code className="text-taxi-400 bg-surface-raised px-1.5 py-0.5 rounded font-mono">
            POST /api/v1/notification/test-push
          </code>
          . This tests in-app alerts, the foreground toast popup, and socket delivery.
        </p>

        {/* Feedback banners */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preset selector pills */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-2">
            Choose Quick Preset:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESETS.map((p) => {
              const Icon = p.icon
              const isSelected = selectedPreset === p.id
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`flex items-center gap-2 rounded-xl p-2.5 text-xs text-left transition-all ${
                    isSelected
                      ? 'bg-taxi-500 text-white font-semibold shadow-sm'
                      : 'bg-surface hover:bg-surface-raised text-text-secondary border border-border-subtle hover:text-text-primary'
                  }`}
                >
                  <Icon size={14} className={isSelected ? 'text-white' : 'text-taxi-400'} />
                  <span className="truncate">{p.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-border-subtle">
          <Input
            label="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Driver Arrived"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Notification Body
            </label>
            <textarea
              rows={2}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="e.g. Driver Arvind has arrived. Share OTP: 2186"
              className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-taxi-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Event Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs text-text-primary focus:border-taxi-500 focus:outline-none"
              >
                {Object.values(NOTIFICATION_TYPES).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Ride ID (optional)"
              value={rideId}
              onChange={(e) => setRideId(e.target.value)}
              placeholder="e.g. 6acce08c..."
            />

            <Input
              label="OTP Code (optional)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="e.g. 2186"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              icon={Send}
              disabled={loading}
            >
              {loading ? 'Sending Test...' : 'Send Test Notification'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
