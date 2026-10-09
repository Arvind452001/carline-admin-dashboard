import { Users, UserCheck, Car, Route, Coins } from 'lucide-react'

export default function CompanyStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* Total Drivers */}
      <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-3">
        <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
          <Users size={20} />
        </div>
        <div>
          <p className="text-xs text-text-muted">Total Drivers</p>
          <p className="text-lg font-bold text-text-primary mt-0.5">125</p>
        </div>
      </div>

      {/* Active Drivers */}
      <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-3">
        <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
          <UserCheck size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted">Active Drivers</p>
          <div className="flex items-baseline justify-between mt-0.5 gap-2">
            <span className="text-lg font-bold text-text-primary">98</span>
            <span className="text-xs font-semibold text-emerald-600">78%</span>
          </div>
        </div>
      </div>

      {/* Vehicles */}
      <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl">
          <Car size={20} />
        </div>
        <div>
          <p className="text-xs text-text-muted">Vehicles</p>
          <p className="text-lg font-bold text-text-primary mt-0.5">110</p>
        </div>
      </div>

      {/* Customers */}
      <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-3">
        <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
          <Users size={20} />
        </div>
        <div>
          <p className="text-xs text-text-muted">Customers</p>
          <p className="text-lg font-bold text-text-primary mt-0.5">4,520</p>
        </div>
      </div>

      {/* Today's Trips */}
      <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-3">
        <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
          <Route size={20} />
        </div>
        <div>
          <p className="text-xs text-text-muted">Today's Trips</p>
          <p className="text-lg font-bold text-text-primary mt-0.5">245</p>
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex items-center gap-3">
        <div className="p-3 bg-teal-500/10 text-teal-600 rounded-xl">
          <Coins size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted">Revenue</p>
          <div className="flex items-baseline justify-between mt-0.5 gap-2">
            <span className="text-lg font-bold text-text-primary">$8,450</span>
          </div>
        </div>
      </div>
    </div>
  )
}
