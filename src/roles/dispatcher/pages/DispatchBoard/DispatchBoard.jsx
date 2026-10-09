import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, User, Car, Star, CheckCircle, Navigation, Sparkles, RefreshCw, XCircle } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'

export default function DispatchBoard() {
  const [searchParams] = useSearchParams()
  const urlTripId = searchParams.get('tripId')
  const urlAuto = searchParams.get('auto') === 'true'

  // Trips lists state
  const [trips, setTrips] = useState([
    { id: 'TR-1001', customer: 'John Mathew', pickup: 'Indore Airport', dest: 'Downtown Hotel', status: 'Pending', vehicle: 'Sedan', passengers: 2 },
    { id: 'TR-1002', customer: 'Mike Ross', pickup: 'Treasure Island Mall', dest: 'Bhopal Station', status: 'Pending', vehicle: 'SUV', passengers: 4 },
    { id: 'TR-1003', customer: 'Alex Vance', pickup: 'Palasia Square', dest: 'Dewas Naka', status: 'Active', vehicle: 'Sedan', passengers: 1 }
  ])

  // Available drivers
  const [drivers, setDrivers] = useState([
    { id: 'D-01', name: 'John Doe', rating: '4.9', distance: '1.2 km', status: 'Online', vehicle: 'Sedan' },
    { id: 'D-02', name: 'Mike Ross', rating: '4.8', distance: '2.4 km', status: 'Online', vehicle: 'SUV' },
    { id: 'D-03', name: 'Alex Vance', rating: '4.7', distance: '3.1 km', status: 'Online', vehicle: 'Sedan' }
  ])

  // Modals state
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [assignmentStep, setAssignmentStep] = useState('select') // 'select' | 'auto-dispatch' | 'progress' | 'rejected'
  const [countdown, setCountdown] = useState(24)
  const [filter, setFilter] = useState('All')

  // Auto Dispatch simulation checks
  const [checks, setChecks] = useState({
    availability: false,
    distance: false,
    compatibility: false,
    priority: false,
    status: false
  })

  // Watch URL params to auto-open simulation
  useEffect(() => {
    if (urlTripId) {
      const trip = trips.find(t => t.id === urlTripId)
      if (trip) {
        setSelectedTrip(trip)
        if (urlAuto) {
          setAssignmentStep('auto-dispatch')
          runAutoDispatchSimulation()
        } else {
          setAssignmentStep('select')
        }
      }
    }
  }, [urlTripId])

  // Run assignment timer
  useEffect(() => {
    let timer
    if (assignmentStep === 'progress' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0 && assignmentStep === 'progress') {
      setAssignmentStep('rejected')
    }
    return () => clearInterval(timer)
  }, [assignmentStep, countdown])

  const runAutoDispatchSimulation = () => {
    setChecks({ availability: false, distance: false, compatibility: false, priority: false, status: false })
    setTimeout(() => setChecks(p => ({ ...p, availability: true })), 400)
    setTimeout(() => setChecks(p => ({ ...p, distance: true })), 800)
    setTimeout(() => setChecks(p => ({ ...p, compatibility: true })), 1200)
    setTimeout(() => setChecks(p => ({ ...p, priority: true })), 1600)
    setTimeout(() => setChecks(p => ({ ...p, status: true })), 2000)
  }

  const handleStartManualDispatch = (trip) => {
    setSelectedTrip(trip)
    setAssignmentStep('select')
  }

  const handleAssignDriver = (driverName) => {
    setCountdown(24)
    setAssignmentStep('progress')
  }

  const handleConfirmAssignment = () => {
    // Modify trip status
    setTrips(prev => prev.map(t => {
      if (t.id === selectedTrip.id) {
        return { ...t, status: 'Assigned' }
      }
      return t
    }))
    setSelectedTrip(null)
  }

  const filterTabs = ['All', 'Pending', 'Unassigned', 'Assigned', 'Active']

  return (
    <PageLayout
      title="Dispatch Board"
      description="Coordinate trip dispatch operations. Drag & Drop or assign available drivers instantly."
    >
      
      {/* Filtering tabs */}
      <div className="flex border-b border-border-strong overflow-x-auto pb-px mb-6 scrollbar-none">
        {filterTabs.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              filter === f
                ? 'border-taxi-500 text-taxi-500'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-subtle'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Trips */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Active Trips Queue</h3>
          <div className="space-y-3">
            {trips
              .filter(t => {
                if (filter === 'Pending') return t.status === 'Pending'
                if (filter === 'Assigned') return t.status === 'Assigned'
                if (filter === 'Active') return t.status === 'Active'
                return true
              })
              .map((trip) => (
                <div key={trip.id} className="bg-surface p-4 rounded-xl border border-border-subtle space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">{trip.id} • {trip.customer}</h4>
                      <p className="text-xs text-text-secondary mt-1">{trip.pickup} → {trip.dest}</p>
                    </div>
                    <StatusBadge status={trip.status.toLowerCase()} />
                  </div>
                  {trip.status === 'Pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        icon={Sparkles}
                        onClick={() => {
                          setSelectedTrip(trip)
                          setAssignmentStep('auto-dispatch')
                          runAutoDispatchSimulation()
                        }}
                      >
                        Auto Dispatch
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => handleStartManualDispatch(trip)}
                      >
                        Assign Driver
                      </Button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Right Column: Drivers */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Available Drivers (Online)</h3>
          <div className="space-y-3">
            {drivers.map((drv) => (
              <div key={drv.id} className="bg-surface p-4 rounded-xl border border-border-subtle flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-taxi-500/10 flex items-center justify-center text-taxi-500">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{drv.name}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{drv.vehicle} • {drv.distance} away</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-medium flex items-center gap-1 justify-end"><Navigation size={10} /> {drv.status}</span>
                  <div className="flex items-center gap-0.5 text-xs text-text-secondary justify-end">
                    <Star size={12} className="text-amber-500 fill-amber-500" /> {drv.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Assignment Wizard Modal */}
      {selectedTrip && (
        <Modal
          open={!!selectedTrip}
          onClose={() => setSelectedTrip(null)}
          title={
            assignmentStep === 'select' ? `Assign Driver for ${selectedTrip.id}` :
            assignmentStep === 'auto-dispatch' ? 'Automatic Dispatch Search' :
            assignmentStep === 'progress' ? 'Dispatch Status' : 'Driver Rejected Assignment'
          }
        >
          {assignmentStep === 'select' && (
            <div className="space-y-4 text-sm">
              <div className="bg-surface p-3.5 rounded-xl border border-border-subtle grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-muted">Trip ID</span>
                  <p className="font-bold text-text-primary mt-0.5">{selectedTrip.id}</p>
                </div>
                <div>
                  <span className="text-text-muted">Vehicle Requested</span>
                  <p className="font-bold text-text-primary mt-0.5">{selectedTrip.vehicle}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-text-muted">Route Details</span>
                  <p className="font-medium text-text-primary mt-0.5">{selectedTrip.pickup} → {selectedTrip.dest}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-text-secondary">Select Driver to Assign:</p>
                <div className="divide-y divide-border-subtle max-h-64 overflow-y-auto">
                  {drivers.map((drv) => (
                    <div key={drv.id} className="py-2.5 flex justify-between items-center hover:bg-surface/50 px-2 rounded-lg transition-colors">
                      <div className="space-y-0.5">
                        <span className="font-bold text-text-primary text-xs">{drv.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-text-muted">
                          <span className="flex items-center gap-0.5"><Star size={10} className="text-amber-500 fill-amber-500" /> {drv.rating}</span>
                          <span>{drv.distance}</span>
                        </div>
                      </div>
                      <Button size="xs" onClick={() => handleAssignDriver(drv.name)}>Assign</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {assignmentStep === 'auto-dispatch' && (
            <div className="space-y-4 text-sm">
              <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2.5">
                <h4 className="text-xs font-bold text-text-secondary">Running Matching Criteria:</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>Checking driver availability...</span>
                    {checks.availability ? <span className="text-emerald-600 font-bold">✓ Verified</span> : <span className="text-text-muted">Searching...</span>}
                  </div>
                  <div className="flex justify-between">
                    <span>Evaluating distance radius...</span>
                    {checks.distance ? <span className="text-emerald-600 font-bold">✓ Verified</span> : <span className="text-text-muted">Searching...</span>}
                  </div>
                  <div className="flex justify-between">
                    <span>Checking vehicle compatibility ({selectedTrip.vehicle})...</span>
                    {checks.compatibility ? <span className="text-emerald-600 font-bold">✓ Verified</span> : <span className="text-text-muted">Searching...</span>}
                  </div>
                  <div className="flex justify-between">
                    <span>Matching driver status priority...</span>
                    {checks.priority ? <span className="text-emerald-600 font-bold">✓ Verified</span> : <span className="text-text-muted">Searching...</span>}
                  </div>
                </div>
              </div>

              {checks.priority ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-emerald-600">Recommended Driver found:</h4>
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-text-primary">John Doe</p>
                      <p className="text-text-muted text-[10px]">1.2 km away • ★ 4.9</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="xs" onClick={() => handleAssignDriver('John Doe')}>Assign Automatically</Button>
                      <Button size="xs" variant="secondary" onClick={() => setAssignmentStep('select')}>Manual Assignment</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 text-text-muted gap-2 text-xs">
                  <RefreshCw className="animate-spin text-taxi-500" size={16} /> Matching algorithms running...
                </div>
              )}
            </div>
          )}

          {assignmentStep === 'progress' && (
            <div className="space-y-4 text-center py-6">
              <div className="relative w-16 h-16 mx-auto bg-taxi-500/10 border border-border-strong rounded-full flex items-center justify-center text-taxi-500">
                <RefreshCw size={24} className="animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-text-primary">Waiting for Driver Response</h4>
                <p className="text-xs text-text-secondary">Timeout countdown: <span className="font-bold text-taxi-500">{countdown}s</span></p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <Button variant="danger" size="xs" onClick={() => setSelectedTrip(null)}>Cancel Assignment</Button>
                <Button variant="secondary" size="xs" onClick={() => setAssignmentStep('select')}>Reassign</Button>
              </div>
            </div>
          )}

          {assignmentStep === 'rejected' && (
            <div className="space-y-4 text-center py-6">
              <div className="w-16 h-16 mx-auto bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-signal-red">
                <XCircle size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-signal-red">Driver Rejected Assignment</h4>
                <p className="text-xs text-text-muted">Reason: Vehicle unavailable / offline</p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <Button size="xs" onClick={() => setAssignmentStep('select')}>Select Another Driver</Button>
                <Button size="xs" variant="secondary" onClick={() => {
                  setAssignmentStep('auto-dispatch')
                  runAutoDispatchSimulation()
                }}>Auto Dispatch</Button>
              </div>
            </div>
          )}

        </Modal>
      )}

    </PageLayout>
  )
}
