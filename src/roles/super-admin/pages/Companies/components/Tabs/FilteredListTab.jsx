import Button from '@/shared/components/Button'
import { HelpCircle } from 'lucide-react'
import { mockDrivers, mockCustomers, mockTrips, mockPayments, mockAuditLogs } from '@/shared/utils/mockData'

export default function FilteredListTab({ activeTab, companyRaw }) {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
        <HelpCircle size={18} className="text-taxi-500 animate-pulse" />
        <h3 className="text-sm font-bold text-text-primary">{activeTab} List</h3>
      </div>

      {activeTab === 'Drivers' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Driver ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Trips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {mockDrivers.slice(0, 4).map((d) => (
                <tr key={d.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-semibold">{d.id}</td>
                  <td className="py-3 px-3">{d.name}</td>
                  <td className="py-3 px-3">{d.vehicle} ({d.plate})</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      d.status === 'online' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' : 'bg-red-500/10 text-red-600 ring-red-500/20'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">{d.trips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Vehicles' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Vehicle Model</th>
                <th className="py-2.5 px-3">Plate Number</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              <tr className="hover:bg-surface/50 transition-colors">
                <td className="py-3 px-3">Toyota Innova Crysta</td>
                <td className="py-3 px-3">MP04 TA 2026</td>
                <td className="py-3 px-3">SUV</td>
                <td className="py-3 px-3"><span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded text-xs ring-1 ring-emerald-500/20">Active</span></td>
              </tr>
              <tr className="hover:bg-surface/50 transition-colors">
                <td className="py-3 px-3">Maruti Suzuki Dzire</td>
                <td className="py-3 px-3">MP04 TB 1211</td>
                <td className="py-3 px-3">Sedan</td>
                <td className="py-3 px-3"><span className="text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded text-xs ring-1 ring-emerald-500/20">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Customers' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Total Trips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {mockCustomers.slice(0, 4).map((c) => (
                <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-semibold">{c.id}</td>
                  <td className="py-3 px-3">{c.name}</td>
                  <td className="py-3 px-3">{c.phone}</td>
                  <td className="py-3 px-3">{c.trips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Bookings' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Pickup</th>
                <th className="py-2.5 px-3">Drop</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {mockTrips.slice(0, 4).map((t) => (
                <tr key={t.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-semibold">{t.id}</td>
                  <td className="py-3 px-3">{t.customer}</td>
                  <td className="py-3 px-3">{t.pickup}</td>
                  <td className="py-3 px-3">{t.dropoff}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center rounded bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-text-primary ring-1 ring-inset ring-slate-500/20`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Pricing' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Base Fares and Dynamic Surcharges for this taxi company segment:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-border-subtle">
              <p className="text-xs text-text-muted">Standard Sedan Rate</p>
              <p className="text-lg font-bold text-text-primary mt-1">$2.50 / mile</p>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border-subtle">
              <p className="text-xs text-text-muted">SUV Rate</p>
              <p className="text-lg font-bold text-text-primary mt-1">$4.00 / mile</p>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border-subtle">
              <p className="text-xs text-text-muted">Night Surcharge</p>
              <p className="text-lg font-bold text-text-primary mt-1">1.2x Multiplier</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Payments' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Payment ID</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {mockPayments.slice(0, 4).map((p) => (
                <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-semibold">{p.id}</td>
                  <td className="py-3 px-3 font-bold text-taxi-500">${p.amount}</td>
                  <td className="py-3 px-3">{p.method}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      p.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' : 'bg-amber-500/10 text-amber-600 ring-amber-500/20'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'IVR' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">IVR Call Flow & Custom Greetings configuration:</p>
          <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2">
            <div className="flex justify-between items-center text-xs border-b border-border-subtle pb-2">
              <span className="font-bold text-text-primary">Phone Hotline</span>
              <span className="text-taxi-500 font-semibold">+1 (555) 123-4567</span>
            </div>
            <p className="text-xs text-text-secondary">Greeting: "Welcome to {companyRaw.name}. Press 1 to book a ride, press 2 for support."</p>
          </div>
        </div>
      )}

      {activeTab === 'AI' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">AI Dispatch and Agent Training settings:</p>
          <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2">
            <p className="text-xs text-text-muted">AI Matching Algorithm</p>
            <p className="text-sm font-bold text-text-primary">Proximity + Driver Rating Optimal Dispatch</p>
            <p className="text-xs text-text-secondary mt-1">Status: Active & Learning</p>
          </div>
        </div>
      )}

      {activeTab === 'Reports' && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Available PDF/Excel reports to compile:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-border-subtle flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">Monthly Performance Summary</p>
                <p className="text-xs text-text-muted">Includes driver ratings & response rates</p>
              </div>
              <Button size="sm">Export</Button>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border-subtle flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">Financial Reconciliation Report</p>
                <p className="text-xs text-text-muted">Detailed payouts, refunds & commission invoices</p>
              </div>
              <Button size="sm">Export</Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Audit Logs' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {mockAuditLogs.slice(0, 4).map((log) => (
                <tr key={log.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 text-text-muted">{log.time}</td>
                  <td className="py-3 px-3">{log.actor}</td>
                  <td className="py-3 px-3">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
