import { useState } from 'react'
import { Link } from 'react-router-dom'
import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import Modal from '@/shared/components/Modal'
import Button from '@/shared/components/Button'
import { mockTrips, mockDrivers, mockCustomers } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'
import { User, Car, Star, Phone, Building, Coins, Clock } from 'lucide-react'

export default function Trips() {
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [activeDriverProfile, setActiveDriverProfile] = useState(null)

  // Find driver detail matching first name
  const driverDetails = selectedTrip && selectedTrip.driver !== '—'
    ? mockDrivers.find((d) => d.name.toLowerCase().startsWith(selectedTrip.driver.toLowerCase()))
    : null

  // Find customer detail
  const customerDetails = selectedTrip
    ? mockCustomers.find((c) => c.name.toLowerCase() === selectedTrip.customer.toLowerCase())
    : null

  return (
    <>
      <GenericListPage
        title="Trips"
        description="All trips across every company on the platform."
        rows={mockTrips}
        searchKeys={['id', 'customer', 'driver']}
        filterField="status"
        filterOptions={[
          { value: 'all', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'ongoing', label: 'Ongoing' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
        columns={[
          { key: 'id', label: 'Trip ID' },
          { key: 'customer', label: 'Customer' },
          { key: 'company', label: 'Company' },
          { key: 'pickup', label: 'Pickup' },
          { key: 'dropoff', label: 'Drop-off' },
          { key: 'driver', label: 'Driver' },
          { key: 'fare', label: 'Fare', render: (r) => currency(r.fare) },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'actions',
            label: 'Action',
            render: (r) => (
              <Button size="sm" variant="secondary" onClick={() => setSelectedTrip(r)}>
                View Details
              </Button>
            ),
          },
        ]}
      />

      {/* Trip Details Modal */}
      <Modal
        open={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        title="Trip Details Overview"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setSelectedTrip(null)}>
            Close
          </Button>
        }
      >
        {selectedTrip && (
          <div className="space-y-5">
            {/* Header / Summary row */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="text-xs font-mono font-medium text-text-muted bg-surface-hover px-2 py-1 rounded">
                  {selectedTrip.id}
                </span>
                <h4 className="text-sm font-semibold text-text-primary mt-1.5 flex items-center gap-1.5">
                  <Building size={16} className="text-text-muted" />
                  {selectedTrip.company || '—'}
                </h4>
              </div>
              <StatusBadge status={selectedTrip.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Route & Fare Card */}
              <div className="space-y-4">
                <div className="bg-surface-hover/40 rounded-xl border border-border-subtle p-4 space-y-4 h-full flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                      <div className="w-0.5 h-12 bg-border-strong border-dashed" />
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                    </div>
                    <div className="flex-1 space-y-3.5">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Pickup Location</div>
                        <div className="text-sm font-semibold text-text-primary">{selectedTrip.pickup}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Drop-off Location</div>
                        <div className="text-sm font-semibold text-text-primary">{selectedTrip.dropoff}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border-subtle/60 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-taxi-500/10 text-taxi-600 rounded-lg">
                        <Coins size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Fare</div>
                        <div className="text-sm font-semibold text-text-primary">{currency(selectedTrip.fare)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                        <Clock size={16} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Time</div>
                        <div className="text-sm font-semibold text-text-primary">{selectedTrip.time || '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer & Driver details */}
              <div className="space-y-4">
                {/* Customer Details Card */}
                <div className="bg-surface-hover/20 rounded-xl border border-border-subtle p-4">
                  <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-2 mb-2.5">
                    <div className="p-1.5 bg-taxi-500/10 text-taxi-600 rounded-lg">
                      <User size={14} />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Customer Details</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-sm">
                    <div>
                      <div className="text-[10px] text-text-muted">Name</div>
                      <div className="font-semibold text-text-primary">{selectedTrip.customer}</div>
                    </div>
                    {customerDetails && (
                      <>
                        <div>
                          <div className="text-[10px] text-text-muted">Phone</div>
                          <div className="font-semibold text-text-primary flex items-center gap-1">
                            <Phone size={10} className="text-text-muted" />
                            {customerDetails.phone}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-text-muted">Account Status</div>
                          <div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                              customerDetails.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {customerDetails.status}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-text-muted">Total Bookings</div>
                          <div className="font-semibold text-text-primary">{customerDetails.trips} trips</div>
                        </div>
                        <div className="col-span-2 border-t border-border-subtle/50 pt-2 mt-1.5 flex justify-end">
                          <Link
                            to={`/super-admin/customers/${customerDetails.id}`}
                            className="text-xs font-semibold text-taxi-600 hover:text-taxi-700 hover:underline flex items-center gap-1"
                          >
                            More Details &rarr;
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Driver Details Card */}
                <div className="bg-surface-hover/20 rounded-xl border border-border-subtle p-4">
                  <div className="flex items-center gap-2 border-b border-border-subtle/50 pb-2 mb-2.5">
                    <div className="p-1.5 bg-taxi-500/10 text-taxi-600 rounded-lg">
                      <Car size={14} />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Driver Details</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-sm">
                    <div>
                      <div className="text-[10px] text-text-muted">Name</div>
                      <div className="font-semibold text-text-primary">{selectedTrip.driver}</div>
                    </div>
                    {driverDetails ? (
                      <>
                        <div>
                          <div className="text-[10px] text-text-muted">Phone</div>
                          <div className="font-semibold text-text-primary flex items-center gap-1">
                            <Phone size={10} className="text-text-muted" />
                            {driverDetails.phone}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-text-muted">Vehicle</div>
                          <div className="font-semibold text-text-primary">{driverDetails.vehicle}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-text-muted">Plate Number</div>
                          <div className="font-mono font-semibold text-text-primary bg-surface-hover px-1 rounded text-[11px] w-max">
                            {driverDetails.plate}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div>
                            <div className="text-[10px] text-text-muted">Rating</div>
                            <div className="font-semibold text-text-primary flex items-center gap-0.5">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              {driverDetails.rating}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-text-muted">Status</div>
                            <div>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                                driverDetails.status === 'online' || driverDetails.status === 'on-trip' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-zinc-100 text-zinc-800'
                              }`}>
                                {driverDetails.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-2 border-t border-border-subtle/50 pt-2 mt-1.5 flex justify-end">
                          <Link
                            to={`/super-admin/drivers/${driverDetails.id}`}
                            className="text-xs font-semibold text-taxi-600 hover:text-taxi-700 hover:underline flex items-center gap-1"
                          >
                            More Details &rarr;
                          </Link>
                        </div>
                      </>
                    ) : (
                      selectedTrip.driver !== '—' && (
                        <div className="col-span-2 text-xs text-text-muted italic">No driver details found</div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Driver Profile Details Modal */}
      <Modal
        open={!!activeDriverProfile}
        onClose={() => setActiveDriverProfile(null)}
        title="Driver Profile Overview"
        size="xl"
        footer={
          <Button variant="secondary" onClick={() => setActiveDriverProfile(null)}>
            Close
          </Button>
        }
      >
        {activeDriverProfile && (
          <div className="space-y-6">
            {/* Header section with driver avatar and details */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-hover/30 p-4 rounded-xl border border-border-subtle gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-taxi-500/10 text-taxi-600 flex items-center justify-center border border-taxi-500/30">
                  <User size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-primary text-base">{activeDriverProfile.name}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 capitalize">
                      {activeDriverProfile.status}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    Company: <span className="font-semibold text-text-secondary">{selectedTrip?.company || 'ABC Taxi'}</span> &bull; Vehicle: <span className="font-semibold text-text-secondary">{activeDriverProfile.vehicle} ({activeDriverProfile.plate})</span>
                  </div>
                </div>
              </div>

              {/* KPIs */}
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial bg-surface-raised px-4 py-2 rounded-lg border border-border-subtle text-center">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Avg Rating</div>
                  <div className="text-sm font-bold text-text-primary mt-1 flex items-center justify-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {activeDriverProfile.rating}
                  </div>
                </div>
                <div className="flex-1 sm:flex-initial bg-surface-raised px-4 py-2 rounded-lg border border-border-subtle text-center">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Total Trips</div>
                  <div className="text-sm font-bold text-text-primary mt-1">{activeDriverProfile.trips}</div>
                </div>
                <div className="flex-1 sm:flex-initial bg-surface-raised px-4 py-2 rounded-lg border border-border-subtle text-center">
                  <div className="text-[10px] uppercase font-bold text-text-muted">Earnings</div>
                  <div className="text-sm font-bold text-text-primary mt-1">{currency(activeDriverProfile.trips * 10)}</div>
                </div>
              </div>
            </div>

            {/* Profile Content Tabs Simulator: Overview */}
            <div className="border-b border-border-subtle pb-1">
              <span className="border-b-2 border-taxi-500 pb-2 text-sm font-semibold text-taxi-600 px-3 cursor-default">
                Overview
              </span>
              {['Documents', 'Vehicle', 'Schedule', 'Availability', 'Trips', 'Earnings', 'Performance', 'Alerts', 'Restrictions', 'History', 'Audit'].map((tab) => (
                <span key={tab} className="text-sm font-medium text-text-muted hover:text-text-primary pb-2 px-3 cursor-not-allowed transition-colors hidden md:inline-block">
                  {tab}
                </span>
              ))}
            </div>

            {/* Grid Sections */}
            <div className="space-y-4">
              {/* Personal & Contact Info */}
              <div className="bg-surface-hover/10 p-4 rounded-xl border border-border-subtle">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 mb-3">
                  Personal & Contact Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-text-muted">Full Name</div>
                    <div className="font-semibold text-text-primary mt-1">{activeDriverProfile.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Email Address</div>
                    <div className="font-semibold text-text-primary mt-1">{activeDriverProfile.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Phone Number</div>
                    <div className="font-semibold text-text-primary mt-1">{activeDriverProfile.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Availability Status Control</div>
                    <div className="mt-1 font-semibold text-text-primary bg-surface-hover px-2.5 py-1 rounded border border-border-subtle w-max">
                      On Duty
                    </div>
                  </div>
                </div>
              </div>

              {/* Address & Emergency Contact */}
              <div className="bg-surface-hover/10 p-4 rounded-xl border border-border-subtle">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 mb-3">
                  Address & Emergency Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-text-muted">Street Address</div>
                    <div className="font-semibold text-text-primary mt-1">{activeDriverProfile.street}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">City / ZIP</div>
                    <div className="font-semibold text-text-primary mt-1">{activeDriverProfile.city} - {activeDriverProfile.zip}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Emergency Contact</div>
                    <div className="font-semibold text-text-primary mt-1">
                      {activeDriverProfile.emergencyName} ({activeDriverProfile.emergencyPhone})
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout & Bank Information */}
              <div className="bg-surface-hover/10 p-4 rounded-xl border border-border-subtle">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle pb-2 mb-3">
                  Payout & Bank Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-text-muted">Bank Name</div>
                    <div className="font-semibold text-text-primary mt-1">{activeDriverProfile.bankName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Account Number</div>
                    <div className="font-mono font-semibold text-text-primary mt-1">{activeDriverProfile.bankAccount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">IFSC / Routing Code</div>
                    <div className="font-mono font-semibold text-text-primary mt-1">{activeDriverProfile.routingNumber}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
