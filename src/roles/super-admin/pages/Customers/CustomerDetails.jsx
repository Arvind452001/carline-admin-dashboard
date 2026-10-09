import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, Calendar, CreditCard, ShieldAlert, CheckCircle, Award } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockCustomers, mockTrips } from '@/shared/utils/mockData'
import { currency } from '@/shared/utils/currency'

export default function CustomerDetails() {
  const { customerId } = useParams()
  const navigate = useNavigate()

  // Find customer matching customerId, fallback to a default mock if not found
  const customerRaw = mockCustomers.find(c => c.id === customerId) || {
    id: customerId || 'CUS-500',
    name: 'John Mathew',
    phone: '+91 9810000000',
    trips: 4,
    status: 'active',
    lastTrip: '24 Aug 2026',
    email: 'johnmathew@gmail.com',
    joinedDate: '12 Jan 2026',
    walletBalance: 350,
    preferredPayment: 'UPI',
    rating: '4.7',
  }

  const [customerStatus, setCustomerStatus] = useState(customerRaw.status)

  const customerTrips = mockTrips.filter(
    (t) => t.customer.toLowerCase() === customerRaw.name.toLowerCase()
  )

  const toggleStatus = () => {
    setCustomerStatus(prev => prev === 'active' ? 'restricted' : 'active')
  }

  return (
    <PageLayout>
      {/* Top Header Row */}
      <div className="bg-white rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-taxi-500/10 border border-border-strong flex items-center justify-center font-bold text-2xl text-taxi-500">
            {customerRaw.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text-primary">{customerRaw.name}</h2>
              <StatusBadge status={customerStatus} />
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
              <span>Customer ID: <span className="font-semibold text-text-secondary">{customerRaw.id}</span></span>
              <span className="text-border-subtle/80">|</span>
              <span>Member Since: <span className="font-semibold text-text-secondary">{customerRaw.joinedDate}</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button
            variant={customerStatus === 'active' ? 'danger' : 'success'}
            icon={customerStatus === 'active' ? ShieldAlert : CheckCircle}
            onClick={toggleStatus}
          >
            {customerStatus === 'active' ? 'Restrict Account' : 'Activate Account'}
          </Button>
        </div>
      </div>

      {/* Profile Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Customer Rating</p>
            <p className="text-lg font-bold text-text-primary mt-0.5">⭐ {customerRaw.rating}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Rides Taken</p>
            <p className="text-lg font-bold text-text-primary mt-0.5">{customerRaw.trips} rides</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-xs text-text-muted">Wallet Balance</p>
            <p className="text-lg font-bold text-text-primary mt-0.5">{currency(customerRaw.walletBalance)}</p>
          </div>
        </div>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white rounded-2xl p-6 border border-border-subtle shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">
            Personal & Contact Info
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted flex items-center gap-1.5"><Phone size={14} /> Phone Number</span>
              <span className="font-semibold text-text-secondary">{customerRaw.phone}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted flex items-center gap-1.5"><Mail size={14} /> Email Address</span>
              <span className="font-semibold text-text-secondary">{customerRaw.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted flex items-center gap-1.5"><Calendar size={14} /> Registration Date</span>
              <span className="font-semibold text-text-secondary">{customerRaw.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Preferences & Billing */}
        <div className="bg-white rounded-2xl p-6 border border-border-subtle shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">
            Preferences & Payment Options
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Preferred Payment Mode</span>
              <span className="font-semibold text-text-secondary">{customerRaw.preferredPayment}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Last Trip Taken</span>
              <span className="font-semibold text-text-secondary">{customerRaw.lastTrip}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Account Status Level</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                customerStatus === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {customerStatus === 'active' ? 'Premium Dispatch Level' : 'Suspended Dispatch'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip History Table */}
      <div className="bg-white rounded-2xl p-6 border border-border-subtle shadow-sm mt-6">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-3 mb-4">
          Trip History
        </h3>
        {customerTrips.length === 0 ? (
          <p className="text-sm text-text-muted">No trips recorded for this customer.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-primary">
              <thead>
                <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                  <th className="py-2.5 px-3">Trip ID</th>
                  <th className="py-2.5 px-3">Driver</th>
                  <th className="py-2.5 px-3">Pickup Location</th>
                  <th className="py-2.5 px-3">Drop-off Location</th>
                  <th className="py-2.5 px-3">Fare</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {customerTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-text-secondary">{trip.id}</td>
                    <td className="py-3 px-3 font-medium">{trip.driver}</td>
                    <td className="py-3 px-3 text-text-muted">{trip.pickup}</td>
                    <td className="py-3 px-3 text-text-muted">{trip.dropoff}</td>
                    <td className="py-3 px-3 font-bold text-taxi-600">{currency(trip.fare)}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        trip.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' : 
                        trip.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-600 ring-rose-500/20' : 
                        trip.status === 'Ongoing' ? 'bg-blue-500/10 text-blue-600 ring-blue-500/20' : 
                        'bg-slate-500/10 text-text-muted ring-slate-500/20'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-text-muted">{trip.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
