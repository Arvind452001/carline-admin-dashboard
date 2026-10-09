import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Plus, Radio, Clock, Grid, AlertCircle, AlertTriangle, UserMinus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'

export default function Dashboard() {
  const navigate = useNavigate()
  const [timeFilter, setTimeFilter] = useState('Today')

  const alerts = [
    { id: 1, type: 'danger', message: 'Driver rejected assignment', details: 'TR-1002 • Vehicle unavailable', icon: AlertCircle },
    { id: 2, type: 'warning', message: 'Trip unassigned for 5 minutes', details: 'TR-1004 • High Priority', icon: AlertTriangle },
    { id: 3, type: 'warning', message: 'Driver response timeout', details: 'TR-1005 • Driver: John Doe', icon: Clock },
    { id: 4, type: 'info', message: 'Customer requested assistance', details: 'TR-1006 • John Smith', icon: UserMinus }
  ]

  return (
    <PageLayout
      title="Dispatcher Dashboard"
      description="Manage bookings, coordinate driver dispatches, and review real-time operations."
      actions={
        <div className="flex items-center gap-2">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="appearance-none rounded-lg border border-border-subtle bg-surface px-3 py-2 pr-8 text-sm text-text-primary focus:border-taxi-500 focus:outline-none"
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Week</option>
          </select>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-surface p-4 rounded-xl border border-border-subtle text-center">
            <p className="text-xs text-text-muted font-bold uppercase">Pending Trips</p>
            <p className="text-2xl font-black text-amber-600 mt-1">24</p>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border-subtle text-center">
            <p className="text-xs text-text-muted font-bold uppercase">Unassigned</p>
            <p className="text-2xl font-black text-signal-red mt-1">8</p>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border-subtle text-center">
            <p className="text-xs text-text-muted font-bold uppercase">Active Trips</p>
            <p className="text-2xl font-black text-signal-blue mt-1">46</p>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border-subtle text-center">
            <p className="text-xs text-text-muted font-bold uppercase">Scheduled</p>
            <p className="text-2xl font-black text-text-primary mt-1">72</p>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border-subtle text-center">
            <p className="text-xs text-text-muted font-bold uppercase">Drivers Online</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">38</p>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border-subtle text-center">
            <p className="text-xs text-text-muted font-bold uppercase">Available</p>
            <p className="text-2xl font-black text-taxi-500 mt-1">24</p>
          </div>
        </div>

        {/* Operations Overview & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Operations list */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Operations Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">Pending</span>
                <span className="text-xs font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">24</span>
              </div>
              <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">Assigning</span>
                <span className="text-xs font-bold bg-purple-500/10 text-signal-purple px-2 py-0.5 rounded">8</span>
              </div>
              <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">Driver Accepted</span>
                <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded">15</span>
              </div>
              <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">In Progress</span>
                <span className="text-xs font-bold bg-signal-blue/10 text-signal-blue px-2 py-0.5 rounded">46</span>
              </div>
              <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">Completed Today</span>
                <span className="text-xs font-bold bg-slate-500/10 text-text-primary px-2 py-0.5 rounded">182</span>
              </div>
              <div className="bg-surface/50 p-3 rounded-lg border border-border-subtle flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">Cancelled</span>
                <span className="text-xs font-bold bg-red-500/10 text-signal-red px-2 py-0.5 rounded">12</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => navigate('/dispatcher/manual-booking')} icon={Plus} className="w-full justify-center">
                Manual Booking
              </Button>
              <Button onClick={() => navigate('/dispatcher/dispatch-board')} icon={Grid} variant="secondary" className="w-full justify-center">
                Dispatch Board
              </Button>
              <Button onClick={() => navigate('/dispatcher/live-trips')} icon={Radio} variant="secondary" className="w-full justify-center">
                Live Trips
              </Button>
              <Button onClick={() => navigate('/dispatcher/pending-trips')} icon={Clock} variant="secondary" className="w-full justify-center">
                Pending Trips
              </Button>
            </div>
          </div>

        </div>

        {/* Alerts and Notifications */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Dispatcher Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((a) => {
              const Icon = a.icon
              return (
                <div key={a.id} className="bg-surface p-4 rounded-xl border border-border-subtle flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    a.type === 'danger' ? 'bg-red-500/10 text-signal-red' : a.type === 'warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-signal-blue/10 text-signal-blue'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{a.message}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{a.details}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </PageLayout>
  )
}
