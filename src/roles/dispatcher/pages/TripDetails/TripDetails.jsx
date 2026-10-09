import { useState } from 'react'
import { ArrowLeft, Clock, MessageSquare, Phone, UserCheck, ShieldAlert, Sparkles, Plus, Edit2, AlertCircle } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'

export default function TripDetails() {
  const [trip, setTrip] = useState({
    id: 'TR-1001',
    status: 'In Progress',
    customer: 'John Smith',
    customerPhone: '+1 555-901-2291',
    driver: 'Mike Johnson',
    driverPhone: '+1 555-802-9911',
    pickup: 'Airport Terminal 1',
    dest: 'Downtown Hotel',
    vehicle: 'Toyota Camry (MP04 T 1209)',
    fare: '$32.50'
  })

  // Timeline
  const timeline = [
    { label: 'Booking Created', done: true },
    { label: 'Driver Assigned', done: true },
    { label: 'Driver Accepted', done: true },
    { label: 'Driver Arrived', done: true },
    { label: 'Trip Started', done: true },
    { label: 'Trip Completed', done: false }
  ]

  // Dispatcher Notes
  const [notes, setNotes] = useState([
    { time: '10:32 AM', author: 'John - Dispatcher', text: 'Customer requested airport pickup at Gate 3.' }
  ])
  const [noteInput, setNoteInput] = useState('')

  // Override Modal state
  const [showOverrideModal, setShowOverrideModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [overrideData, setOverrideData] = useState({
    newDriver: 'Alex Vance',
    reason: '',
    type: 'Driver Reassignment'
  })

  // Customer Assistance state
  const [showCustomerModal, setShowCustomerModal] = useState(false)

  const handleAddNote = (e) => {
    e.preventDefault()
    if (!noteInput) return
    const now = new Date()
    const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()} ${now.getHours() >= 12 ? 'PM' : 'AM'}`
    setNotes(prev => [
      ...prev,
      { time: timeStr, author: 'You - Dispatcher', text: noteInput }
    ])
    setNoteInput('')
  }

  const handleConfirmOverride = () => {
    // Perform override re-assignment
    setTrip(prev => ({
      ...prev,
      driver: overrideData.newDriver,
      status: 'Driver Assigned' // reset timeline step
    }))
    setShowConfirmModal(false)
    setShowOverrideModal(false)
  }

  return (
    <PageLayout
      title={`Trip ${trip.id}`}
      description="Review trip timeline checkpoints, contact driver, or initiate override commands."
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.history.back()}>Back</Button>
          <Button variant="secondary" icon={Phone} onClick={() => setShowCustomerModal(true)}>
            Customer Assistance
          </Button>
          <Button variant="danger" icon={ShieldAlert} onClick={() => setShowOverrideModal(true)}>
            Override Trip
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Metadata details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Trip Summary Card */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <h3 className="text-sm font-bold text-text-primary">Trip Overview</h3>
              <StatusBadge status={trip.status.toLowerCase()} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                <span className="text-text-muted">Customer Name</span>
                <p className="font-bold text-text-primary mt-1">{trip.customer}</p>
                <p className="text-[10px] text-text-secondary mt-0.5">{trip.customerPhone}</p>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                <span className="text-text-muted">Assigned Driver</span>
                <p className="font-bold text-text-primary mt-1">{trip.driver}</p>
                <p className="text-[10px] text-text-secondary mt-0.5">{trip.driverPhone}</p>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-border-subtle col-span-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-text-muted">Pickup Location</span>
                    <p className="font-medium text-text-primary mt-1">{trip.pickup}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Drop Destination</span>
                    <p className="font-medium text-text-primary mt-1">{trip.dest}</p>
                  </div>
                </div>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                <span className="text-text-muted">Vehicle Details</span>
                <p className="font-medium text-text-primary mt-1">{trip.vehicle}</p>
              </div>
              <div className="bg-surface p-3 rounded-lg border border-border-subtle">
                <span className="text-text-muted">Ride Fare</span>
                <p className="font-bold text-taxi-500 mt-1">{trip.fare}</p>
              </div>
            </div>
          </div>

          {/* Dispatcher Notes Section */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Dispatcher Notes</h3>
            
            {/* Input field */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Type note for this trip segment..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="flex-1 rounded-xl border border-border-subtle bg-surface px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted/70 focus:border-taxi-500 focus:outline-none"
              />
              <Button type="submit" icon={Plus}>Add Note</Button>
            </form>

            {/* Note logs list */}
            <div className="space-y-3 pt-2">
              {notes.map((n, idx) => (
                <div key={idx} className="bg-surface p-3 rounded-xl border border-border-subtle space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-text-muted border-b border-border-subtle/50 pb-1">
                    <span className="font-bold text-text-primary">{n.author}</span>
                    <span>{n.time}</span>
                  </div>
                  <p className="text-xs text-text-secondary pt-1">{n.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Timeline & Overrides */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Live Timeline</h3>
          
          <div className="relative border-l border-border-strong ml-2.5 pl-5 space-y-5">
            {timeline.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Dot */}
                <div className={`absolute -left-[26px] top-0.5 w-3 h-3 rounded-full border-2 ${
                  step.done ? 'bg-taxi-500 border-taxi-500' : 'bg-surface border-border-strong'
                }`} />
                <span className={`text-xs font-semibold ${step.done ? 'text-text-primary' : 'text-text-muted'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Override Trip Modal */}
      {showOverrideModal && (
        <Modal
          open={showOverrideModal}
          onClose={() => setShowOverrideModal(false)}
          title="Override Trip Dispatch"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowOverrideModal(false)}>Cancel</Button>
              <Button onClick={() => setShowConfirmModal(true)}>Confirm Override</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-xs text-signal-red flex items-start gap-2">
              <AlertCircle size={16} />
              <span><strong>Warning:</strong> Overriding active dispatches alters live status logs and notifies drivers.</span>
            </div>

            <Select
              label="Override Type *"
              value={overrideData.type}
              onChange={(e) => setOverrideData(prev => ({ ...prev, type: e.target.value }))}
              options={[
                { value: 'Driver Reassignment', label: 'Driver Reassignment' },
                { value: 'Fare Override', label: 'Fare Override' },
                { value: 'Pickup Override', label: 'Pickup Override' },
                { value: 'Destination Override', label: 'Destination Override' }
              ]}
            />
            
            <Select
              label="New Driver Selection"
              value={overrideData.newDriver}
              onChange={(e) => setOverrideData(prev => ({ ...prev, newDriver: e.target.value }))}
              options={[
                { value: 'Alex Vance', label: 'Alex Vance (Sedan • 1.2km)' },
                { value: 'John Doe', label: 'John Doe (Sedan • 2.4km)' }
              ]}
            />

            <Input
              label="Reason for Override *"
              required
              value={overrideData.reason}
              onChange={(e) => setOverrideData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Current driver vehicle breakdown"
            />
          </div>
        </Modal>
      )}

      {/* Double Confirmation Modal */}
      {showConfirmModal && (
        <Modal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Double Confirmation Required"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
              <Button onClick={handleConfirmOverride}>Confirm Action</Button>
            </>
          }
        >
          <div className="space-y-2 text-sm">
            <p className="text-text-primary font-bold">Are you absolutely sure you want to perform this override?</p>
            <p className="text-text-secondary text-xs">This event will be recorded in the system audit logs under your administrator credentials.</p>
          </div>
        </Modal>
      )}

      {/* Customer Assistance Modal */}
      {showCustomerModal && (
        <Modal
          open={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          title="Customer Assistance Control"
          footer={
            <Button onClick={() => setShowCustomerModal(false)}>Close Assistance</Button>
          }
        >
          <div className="space-y-4">
            <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2 text-xs">
              <h4 className="font-bold text-text-primary">{trip.customer}</h4>
              <p className="text-text-secondary">Phone: {trip.customerPhone}</p>
              <p className="text-text-secondary">Default Pickup: {trip.pickup}</p>
              <p className="text-text-muted mt-2">Active Trip Status: <strong>{trip.status}</strong></p>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="secondary" size="xs">Call Customer</Button>
              <Button variant="secondary" size="xs">Send Message</Button>
              <Button variant="secondary" size="xs">Modify Booking</Button>
              <Button variant="danger" size="xs">Cancel Booking</Button>
            </div>
          </div>
        </Modal>
      )}

    </PageLayout>
  )
}
