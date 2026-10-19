import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, Radio, Clock, Grid, AlertCircle, AlertTriangle, RefreshCw, 
  Calendar, CheckCircle2, Car, MapPin, Phone, User, Sparkles, UserCheck, 
  XCircle, Navigation, ExternalLink, ArrowRight, ShieldCheck, ChevronRight, Activity
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Modal from '@/shared/components/Modal'
import { dispatcherApi } from '../../services/dispatcherApi'

export default function Dashboard() {
  const navigate = useNavigate()
  const [timeFilter, setTimeFilter] = useState('Today')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'pending' | 'live' | 'scheduled' | 'drivers'
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Aggregated Data States
  const [pendingTrips, setPendingTrips] = useState([])
  const [liveTrips, setLiveTrips] = useState([])
  const [scheduledTrips, setScheduledTrips] = useState([])
  const [completedTrips, setCompletedTrips] = useState([])
  const [cancelledTrips, setCancelledTrips] = useState([])
  const [drivers, setDrivers] = useState([])
  
  // KPI Stats
  const [stats, setStats] = useState({
    pendingTrips: 0,
    unassignedTrips: 0,
    activeTrips: 0,
    scheduledTrips: 0,
    completedToday: 0,
    cancelledTrips: 0,
    driversOnline: 0,
    driversAvailable: 0,
    driversBusy: 0,
    totalGMV: 0,
  })

  // Driver Assignment Modal State
  const [assignModalTrip, setAssignModalTrip] = useState(null)
  const [selectedDriverId, setSelectedDriverId] = useState('')

  /**
   * Comprehensive Data Fetcher:
   * Queries all individual endpoints concurrently via Promise.allSettled
   * so that even if one endpoint is missing/failing, all other data loads smoothly.
   */
  const fetchAllDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const [
        statsRes,
        pendingRes,
        liveRes,
        scheduledRes,
        completedRes,
        cancelledRes,
        mapRes,
        allTripsRes
      ] = await Promise.allSettled([
        dispatcherApi.getStats(),
        dispatcherApi.getPendingTrips({ limit: 15 }),
        dispatcherApi.getLiveTrips(),
        dispatcherApi.getScheduledTrips({ limit: 10 }),
        dispatcherApi.getCompletedTrips({ limit: 10 }),
        dispatcherApi.getCancelledTrips({ limit: 10 }),
        dispatcherApi.getLiveMap(),



        
        dispatcherApi.getTrips({ limit: 30 })
      ])

      // 1. Process Pending Trips
      let pendingList = []
      if (pendingRes.status === 'fulfilled' && pendingRes.value?.trips) {
        pendingList = pendingRes.value.trips
      } else if (allTripsRes.status === 'fulfilled' && allTripsRes.value?.trips) {
        pendingList = allTripsRes.value.trips.filter(t => t.statusSlug === 'pending')
      }
      setPendingTrips(pendingList)

      // 2. Process Live / Ongoing Trips
      let liveList = []
      if (liveRes.status === 'fulfilled' && liveRes.value?.trips) {
        liveList = liveRes.value.trips
      } else if (allTripsRes.status === 'fulfilled' && allTripsRes.value?.trips) {
        liveList = allTripsRes.value.trips.filter(t => t.statusSlug === 'ongoing' || t.statusSlug === 'dispatched')
      }
      setLiveTrips(liveList)

      // 3. Process Scheduled Trips
      let scheduledList = []
      if (scheduledRes.status === 'fulfilled' && scheduledRes.value?.trips) {
        scheduledList = scheduledRes.value.trips
      } else if (allTripsRes.status === 'fulfilled' && allTripsRes.value?.trips) {
        scheduledList = allTripsRes.value.trips.filter(t => t.statusSlug === 'scheduled')
      }
      setScheduledTrips(scheduledList)

      // 4. Process Completed Trips
      let completedList = []
      if (completedRes.status === 'fulfilled' && completedRes.value?.trips) {
        completedList = completedRes.value.trips
      } else if (allTripsRes.status === 'fulfilled' && allTripsRes.value?.trips) {
        completedList = allTripsRes.value.trips.filter(t => t.statusSlug === 'completed')
      }
      setCompletedTrips(completedList)

      // 5. Process Cancelled Trips
      let cancelledList = []
      if (cancelledRes.status === 'fulfilled' && cancelledRes.value?.trips) {
        cancelledList = cancelledRes.value.trips
      } else if (allTripsRes.status === 'fulfilled' && allTripsRes.value?.trips) {
        cancelledList = allTripsRes.value.trips.filter(t => t.statusSlug === 'cancelled')
      }
      setCancelledTrips(cancelledList)

      // 6. Process Drivers from Live Map
      let driverList = []
      if (mapRes.status === 'fulfilled') {
        const rawMap = mapRes.value?.data || mapRes.value || {}
        driverList = rawMap.drivers || (Array.isArray(rawMap) ? rawMap : [])
      }
      setDrivers(driverList)

      // 7. Calculate Aggregated Stats & Fallbacks
      const rawStats = statsRes.status === 'fulfilled' ? (statsRes.value?.data || statsRes.value || {}) : {}
      const pendingCount = rawStats.pendingTrips ?? pendingList.length
      const liveCount = rawStats.activeTrips ?? liveList.length
      const scheduledCount = rawStats.scheduledTrips ?? scheduledList.length
      const completedCount = rawStats.completedToday ?? completedList.length
      const cancelledCount = rawStats.cancelledTrips ?? cancelledList.length

      const availableDriversCount = driverList.filter(d => 
        d.status === 'AVAILABLE' || d.status === 'ACTIVE' || d.isAvailable
      ).length

      const busyDriversCount = driverList.filter(d => 
        d.status === 'ON_TRIP' || d.status === 'BUSY' || d.status === 'RIDING' || d.status === 'ONGOING'
      ).length

      const onlineDriversCount = driverList.length || (availableDriversCount + busyDriversCount)

      // Calculate total collected revenue from completed trips
      const revenueToday = completedList.reduce((acc, t) => acc + (Number(t.fare?.amount) || 0), 0)

      setStats({
        pendingTrips: pendingCount,
        unassignedTrips: pendingList.filter(t => !t.driver).length || pendingCount,
        activeTrips: liveCount,
        scheduledTrips: scheduledCount,
        completedToday: completedCount,
        cancelledTrips: cancelledCount,
        driversOnline: rawStats.driversOnline ?? onlineDriversCount,
        driversAvailable: rawStats.driversAvailable ?? availableDriversCount,
        driversBusy: rawStats.driversBusy ?? busyDriversCount,
        totalGMV: revenueToday,
      })

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Could not refresh all dashboard feeds. Showing cached data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllDashboardData()
    const interval = setInterval(fetchAllDashboardData, 20000)
    return () => clearInterval(interval)
  }, [fetchAllDashboardData])

  // Auto Assign Driver Handler
  const handleAutoAssign = async (trip) => {
    try {
      setActionLoading(true)
      setSuccessMsg('')
      setError('')
      const res = await dispatcherApi.autoAssignDriver(trip.id)
      setSuccessMsg(`Auto assigned driver successfully to ${trip.tripId}!`)
      fetchAllDashboardData()
    } catch (err) {
      console.error('Auto assign error:', err)
      setError(err?.message || 'Failed to auto-assign driver')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Manual Assign Modal
  const openAssignModal = (trip) => {
    setAssignModalTrip(trip)
    if (drivers.length > 0) {
      const firstAvailable = drivers.find(d => d.status === 'AVAILABLE' || d.status === 'ACTIVE') || drivers[0]
      setSelectedDriverId(firstAvailable.id || firstAvailable._id || '')
    } else {
      setSelectedDriverId('')
    }
  }

  // Manual Assign Driver Handler
  const handleManualAssign = async () => {
    if (!selectedDriverId || !assignModalTrip) return
    try {
      setActionLoading(true)
      setError('')
      setSuccessMsg('')
      const selectedDrv = drivers.find(d => (d.id || d._id) === selectedDriverId)
      await dispatcherApi.assignDriver(assignModalTrip.id, selectedDriverId)
      setSuccessMsg(`Driver ${selectedDrv?.name || 'assigned'} linked to trip ${assignModalTrip.tripId}!`)
      setAssignModalTrip(null)
      setSelectedDriverId('')
      fetchAllDashboardData()
    } catch (err) {
      console.error('Manual assign error:', err)
      setError(err?.message || 'Failed to assign driver')
    } finally {
      setActionLoading(false)
    }
  }

  // Dynamic Alerts Generation based on Live Operations
  const dynamicAlerts = useMemo(() => {
    const list = []
    if (stats.unassignedTrips > 0) {
      list.push({
        id: 'unassigned-alert',
        type: 'danger',
        title: 'Unassigned Bookings Pending Dispatch',
        details: `${stats.unassignedTrips} trip requests waiting for driver assignment.`,
        actionText: 'View Pending',
        onClick: () => navigate('/dispatcher/pending-trips'),
        icon: AlertTriangle,
      })
    }
    if (stats.driversAvailable === 0 && stats.pendingTrips > 0) {
      list.push({
        id: 'driver-shortage',
        type: 'warning',
        title: 'Driver Shortage Alert',
        details: 'No available drivers online while trip requests are in queue.',
        actionText: 'Open Map',
        onClick: () => navigate('/dispatcher/maps'),
        icon: AlertCircle,
      })
    }
    if (stats.activeTrips > 0) {
      list.push({
        id: 'active-trips-status',
        type: 'info',
        title: 'Active Operations in Transit',
        details: `${stats.activeTrips} live trips currently running on the road.`,
        actionText: 'Track Live',
        onClick: () => navigate('/dispatcher/live-trips'),
        icon: Radio,
      })
    }
    if (list.length === 0) {
      list.push({
        id: 'all-clear',
        type: 'success',
        title: 'Operations Running Smoothly',
        details: `${stats.driversAvailable} drivers available across active zones. All rides dispatched.`,
        actionText: 'Dispatch Board',
        onClick: () => navigate('/dispatcher/dispatch-board'),
        icon: ShieldCheck,
      })
    }
    return list
  }, [stats, navigate])

  return (
    <PageLayout
      title="Dispatcher Operations Center"
      description="Real-time multi-feed overview of bookings, active trips, fleet availability, and dispatch queues."
      actions={
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Feed Active</span>
          </div>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="appearance-none rounded-xl border border-border-subtle bg-surface px-3 py-2 text-xs font-medium text-text-primary focus:border-taxi-500 focus:outline-none cursor-pointer"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>All Time</option>
          </select>

          <Button 
            variant="secondary" 
            icon={RefreshCw} 
            onClick={fetchAllDashboardData} 
            disabled={loading}
            className="text-xs"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button 
            icon={Plus} 
            onClick={() => navigate('/dispatcher/manual-booking')}
            className="text-xs font-bold"
          >
            New Booking
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner Messages */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="font-bold hover:opacity-75">✕</button>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
            <button onClick={fetchAllDashboardData} className="underline font-bold">Retry</button>
          </div>
        )}

        {/* 1. TOP OPERATIONAL KPI METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Pending */}
          <div 
            onClick={() => navigate('/dispatcher/pending-trips')}
            className="bg-surface hover:bg-surface-hover p-4 rounded-2xl border border-border-subtle hover:border-amber-500/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Pending</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.pendingTrips}</p>
              <p className="text-[10px] text-text-muted mt-0.5 flex items-center gap-1">
                {stats.unassignedTrips > 0 ? (
                  <span className="text-rose-500 font-semibold">{stats.unassignedTrips} Unassigned</span>
                ) : (
                  <span>Awaiting Dispatch</span>
                )}
              </p>
            </div>
          </div>

          {/* Card 2: Live / Active */}
          <div 
            onClick={() => navigate('/dispatcher/live-trips')}
            className="bg-surface hover:bg-surface-hover p-4 rounded-2xl border border-border-subtle hover:border-signal-blue/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Active Trips</span>
              <div className="w-8 h-8 rounded-xl bg-signal-blue/10 text-signal-blue flex items-center justify-center group-hover:scale-110 transition-transform">
                <Radio size={16} className={stats.activeTrips > 0 ? 'animate-pulse' : ''} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-signal-blue">{stats.activeTrips}</p>
              <p className="text-[10px] text-text-muted mt-0.5">In Transit Now</p>
            </div>
          </div>

          {/* Card 3: Scheduled */}
          <div 
            onClick={() => navigate('/dispatcher/scheduled-trips')}
            className="bg-surface hover:bg-surface-hover p-4 rounded-2xl border border-border-subtle hover:border-purple-500/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Scheduled</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar size={16} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-text-primary">{stats.scheduledTrips}</p>
              <p className="text-[10px] text-text-muted mt-0.5">Upcoming Bookings</p>
            </div>
          </div>

          {/* Card 4: Completed */}
          <div 
            onClick={() => navigate('/dispatcher/completed-trips')}
            className="bg-surface hover:bg-surface-hover p-4 rounded-2xl border border-border-subtle hover:border-emerald-500/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Completed</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-emerald-600">{stats.completedToday}</p>
              <p className="text-[10px] text-text-muted mt-0.5">Finished Today</p>
            </div>
          </div>

          {/* Card 5: Fleet Online */}
          <div 
            onClick={() => navigate('/dispatcher/maps')}
            className="bg-surface hover:bg-surface-hover p-4 rounded-2xl border border-border-subtle hover:border-taxi-500/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Drivers Online</span>
              <div className="w-8 h-8 rounded-xl bg-taxi-500/10 text-taxi-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Car size={16} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-text-primary">{stats.driversOnline}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{stats.driversAvailable} Available</p>
            </div>
          </div>

          {/* Card 6: Cancelled */}
          <div 
            onClick={() => navigate('/dispatcher/cancelled-trips')}
            className="bg-surface hover:bg-surface-hover p-4 rounded-2xl border border-border-subtle hover:border-rose-500/50 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Cancelled</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <XCircle size={16} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-black text-rose-500">{stats.cancelledTrips}</p>
              <p className="text-[10px] text-text-muted mt-0.5">Voided Bookings</p>
            </div>
          </div>
        </div>

        {/* 2. OPERATIONS CONTROL BAR & QUICK SHORTCUTS */}
        <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Section Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-taxi-500 text-ink shadow-sm'
                  : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              All Operations Overview
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              <span>Pending Queue</span>
              {pendingTrips.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-extrabold">
                  {pendingTrips.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'live'
                  ? 'bg-signal-blue text-white shadow-sm'
                  : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              <span>Live Rides</span>
              {liveTrips.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-extrabold">
                  {liveTrips.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'scheduled'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              <span>Scheduled Pickups</span>
              {scheduledTrips.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-extrabold">
                  {scheduledTrips.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'drivers'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              <span>Fleet Drivers</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-white/20 font-extrabold">
                {drivers.length}
              </span>
            </button>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="xs"
              variant="secondary"
              icon={Grid}
              onClick={() => navigate('/dispatcher/dispatch-board')}
              className="text-xs"
            >
              Dispatch Board
            </Button>
            <Button
              size="xs"
              variant="secondary"
              icon={Navigation}
              onClick={() => navigate('/dispatcher/maps')}
              className="text-xs"
            >
              Live Map
            </Button>
          </div>
        </div>

        {/* 3. DYNAMIC DISPATCHER ALERTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {dynamicAlerts.map((a) => {
            const Icon = a.icon
            return (
              <div
                key={a.id}
                onClick={a.onClick}
                className="bg-surface hover:bg-surface-hover p-4 rounded-2xl border border-border-subtle hover:border-border-strong transition-all cursor-pointer flex items-start gap-3.5 shadow-sm group"
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  a.type === 'danger'
                    ? 'bg-rose-500/10 text-rose-500'
                    : a.type === 'warning'
                    ? 'bg-amber-500/10 text-amber-500'
                    : a.type === 'info'
                    ? 'bg-signal-blue/10 text-signal-blue'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-text-primary truncate">{a.title}</h4>
                    <span className="text-[10px] text-taxi-500 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {a.actionText} <ChevronRight size={10} />
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{a.details}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* 4. MAIN INTERACTIVE DATA SECTIONS */}

        {/* --- SECTION A: URGENT PENDING DISPATCH QUEUE --- */}
        {(activeTab === 'all' || activeTab === 'pending') && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <span>Pending Dispatch Queue</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      {pendingTrips.length} Awaiting Driver
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted">Instant matching and driver assignment queue for new bookings</p>
                </div>
              </div>
              <Button
                size="xs"
                variant="secondary"
                icon={ArrowRight}
                onClick={() => navigate('/dispatcher/pending-trips')}
                className="self-start sm:self-auto text-xs"
              >
                View Full Queue
              </Button>
            </div>

            {loading && pendingTrips.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-taxi-500" />
                Loading pending bookings...
              </div>
            ) : pendingTrips.length === 0 ? (
              <div className="py-8 text-center rounded-xl bg-surface/50 border border-dashed border-border-subtle">
                <ShieldCheck size={28} className="mx-auto text-emerald-500 mb-1.5" />
                <p className="text-xs font-bold text-text-primary">All Bookings Dispatched!</p>
                <p className="text-[11px] text-text-muted mt-0.5">There are no pending trip requests awaiting assignment right now.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase font-bold">
                      <th className="py-2.5 px-3">Trip ID</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Route (Pickup → Dropoff)</th>
                      <th className="py-2.5 px-3">Vehicle Type</th>
                      <th className="py-2.5 px-3">Fare</th>
                      <th className="py-2.5 px-3 text-right">Quick Dispatch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {pendingTrips.slice(0, 6).map((t) => (
                      <tr key={t.id} className="hover:bg-surface/60 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-text-primary">{t.tripId}</span>
                          <p className="text-[10px] text-text-muted">{t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-text-primary">{t.customer?.name || 'Customer'}</p>
                          {t.customer?.phone && (
                            <p className="text-[10px] text-text-muted flex items-center gap-1">
                              <Phone size={9} /> {t.customer.phone}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-3 max-w-[220px]">
                          <p className="text-text-primary truncate font-medium" title={t.pickup?.address}>
                            🟢 {t.pickup?.address || 'Pickup Point'}
                          </p>
                          <p className="text-text-secondary truncate text-[11px] mt-0.5" title={t.dropoff?.address}>
                            🔴 {t.dropoff?.address || 'Destination Point'}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-border-subtle text-[11px] font-medium text-text-primary">
                            <Car size={11} className="text-taxi-500" />
                            {t.driver?.vehicleType || t.vehicleTypeName || 'Standard Sedan'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-taxi-500">
                            {t.fare?.amount != null ? `$${t.fare.amount}` : '$0'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleAutoAssign(t)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] font-bold shadow-sm flex items-center gap-1 active:scale-95 disabled:opacity-50 transition-all"
                              title="Auto Match nearest driver"
                            >
                              <Sparkles size={11} />
                              <span>Auto</span>
                            </button>
                            <button
                              onClick={() => openAssignModal(t)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-hover border border-border-strong text-text-primary text-[11px] font-semibold flex items-center gap-1 active:scale-95 disabled:opacity-50 transition-all"
                              title="Manually assign driver"
                            >
                              <UserCheck size={11} className="text-taxi-500" />
                              <span>Assign</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- SECTION B: TWO-COLUMN ACTIVE TRIPS & FLEET OVERVIEW --- */}
        {(activeTab === 'all' || activeTab === 'live' || activeTab === 'drivers') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Active Live Trips in Transit */}
            {(activeTab === 'all' || activeTab === 'live') && (
              <div className="glass-card rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-signal-blue/10 text-signal-blue flex items-center justify-center">
                        <Radio size={16} className={liveTrips.length > 0 ? 'animate-pulse' : ''} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-primary">Live Trips In Progress</h3>
                        <p className="text-[11px] text-text-muted">{liveTrips.length} active vehicles on road</p>
                      </div>
                    </div>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => navigate('/dispatcher/live-trips')}
                    >
                      Track All
                    </Button>
                  </div>

                  {liveTrips.length === 0 ? (
                    <div className="py-12 text-center text-xs text-text-muted">
                      <Activity size={24} className="mx-auto mb-1.5 opacity-40 text-signal-blue" />
                      No active rides on route at this moment.
                    </div>
                  ) : (
                    <div className="space-y-3 mt-4 max-h-[380px] overflow-y-auto pr-1">
                      {liveTrips.slice(0, 5).map((trip) => (
                        <div 
                          key={trip.id}
                          onClick={() => navigate('/dispatcher/live-trips')}
                          className="bg-surface hover:bg-surface-hover p-3.5 rounded-xl border border-border-subtle hover:border-signal-blue/40 transition-all cursor-pointer space-y-2.5"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-text-primary text-xs">{trip.tripId}</span>
                              <span className="text-[10px] text-text-muted ml-2">• Driver: <strong className="text-text-primary">{trip.driver?.name || 'Assigned'}</strong></span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-signal-blue/10 text-signal-blue uppercase">
                              In Transit
                            </span>
                          </div>

                          <div className="text-[11px] text-text-secondary">
                            <p className="truncate">📍 {trip.pickup?.address || 'Pickup'} → {trip.dropoff?.address || 'Dropoff'}</p>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-text-muted pt-2 border-t border-border-subtle/50">
                            <span>Passenger: <strong className="text-text-primary">{trip.customer?.name || 'Guest'}</strong></span>
                            <span className="font-bold text-taxi-500">${trip.fare?.amount || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button 
                    variant="secondary" 
                    icon={Navigation}
                    onClick={() => navigate('/dispatcher/live-trips')} 
                    className="w-full justify-center text-xs"
                  >
                    Open Full Real-time Map Tracker
                  </Button>
                </div>
              </div>
            )}

            {/* Right: Company Drivers / Fleet Online Status */}
            {(activeTab === 'all' || activeTab === 'drivers') && (
              <div className="glass-card rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Car size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-primary">Fleet Drivers Status</h3>
                        <p className="text-[11px] text-text-muted">
                          {stats.driversAvailable} of {drivers.length || stats.driversOnline} Available for Trips
                        </p>
                      </div>
                    </div>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => navigate('/dispatcher/maps')}
                    >
                      Driver Map
                    </Button>
                  </div>

                  {drivers.length === 0 ? (
                    <div className="py-12 text-center text-xs text-text-muted">
                      <Car size={24} className="mx-auto mb-1.5 opacity-40 text-emerald-500" />
                      No driver fleet data loaded.
                    </div>
                  ) : (
                    <div className="space-y-2.5 mt-4 max-h-[380px] overflow-y-auto pr-1">
                      {drivers.slice(0, 6).map((drv) => {
                        const dId = drv.id || drv._id || drv.driverId
                        const dName = drv.name || drv.fullName || 'Driver'
                        const isFree = drv.status === 'AVAILABLE' || drv.status === 'ACTIVE' || drv.isAvailable
                        const isOnTrip = drv.status === 'ON_TRIP' || drv.status === 'BUSY' || drv.status === 'RIDING' || drv.status === 'ONGOING'
                        return (
                          <div 
                            key={dId}
                            className="p-3 rounded-xl bg-surface border border-border-subtle flex justify-between items-center"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-taxi-500/10 text-taxi-500 flex items-center justify-center text-xs font-bold">
                                {dName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-text-primary">{dName}</h4>
                                <p className="text-[10px] text-text-muted">
                                  {drv.vehicleType || 'Sedan'} {drv.phone ? `• ${drv.phone}` : ''}
                                </p>
                              </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              isFree
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : isOnTrip
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                : 'bg-slate-500/10 text-slate-400'
                            }`}>
                              {isFree ? 'AVAILABLE' : (isOnTrip ? 'ON TRIP' : (drv.status || 'OFFLINE'))}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button 
                    variant="secondary" 
                    icon={Grid}
                    onClick={() => navigate('/dispatcher/dispatch-board')} 
                    className="w-full justify-center text-xs"
                  >
                    Open Dispatch Board
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- SECTION C: SCHEDULED & RECENT COMPLETED TRIPS --- */}
        {(activeTab === 'all' || activeTab === 'scheduled') && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Upcoming Scheduled Bookings</h3>
                  <p className="text-xs text-text-muted">Advance ride reservations and dispatch schedule</p>
                </div>
              </div>
              <Button
                size="xs"
                variant="secondary"
                onClick={() => navigate('/dispatcher/scheduled-trips')}
              >
                View All Scheduled
              </Button>
            </div>

            {scheduledTrips.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No advance scheduled bookings for today.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {scheduledTrips.slice(0, 6).map((trip) => (
                  <div 
                    key={trip.id}
                    onClick={() => navigate('/dispatcher/scheduled-trips')}
                    className="bg-surface hover:bg-surface-hover p-4 rounded-xl border border-border-subtle hover:border-purple-500/30 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-text-primary">{trip.tripId}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600">
                        {trip.scheduledAt ? new Date(trip.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Upcoming'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-text-primary">{trip.customer?.name || 'Customer'}</p>
                    <p className="text-[11px] text-text-secondary truncate">
                      {trip.pickup?.address || 'Pickup'} → {trip.dropoff?.address || 'Destination'}
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-border-subtle/50 text-[10px] text-text-muted">
                      <span>Vehicle: <strong>{trip.driver?.vehicleType || 'Standard'}</strong></span>
                      <span className="font-bold text-taxi-500">${trip.fare?.amount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MANUAL ASSIGN DRIVER MODAL */}
      {assignModalTrip && (
        <Modal 
          open={true} 
          isOpen={true} 
          onClose={() => setAssignModalTrip(null)} 
          title={`Assign Driver to ${assignModalTrip.tripId}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-surface rounded-xl border border-border-subtle space-y-1.5">
              <p className="font-bold text-text-primary">Trip Details:</p>
              <p className="text-text-secondary">Customer: <strong>{assignModalTrip.customer?.name || 'Guest'}</strong> • Vehicle: <strong>{assignModalTrip.driver?.vehicleType || 'Standard Sedan'}</strong></p>
              <p className="text-text-secondary truncate">Route: {assignModalTrip.pickup?.address} → {assignModalTrip.dropoff?.address}</p>
              <p className="text-taxi-500 font-bold">Estimated Fare: ${assignModalTrip.fare?.amount || 0}</p>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1.5">Select Available Company Driver:</label>
              {drivers.length === 0 ? (
                <p className="text-text-muted italic py-3 text-center">No drivers loaded in active fleet.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {drivers.map((d) => {
                    const dId = d.id || d._id || d.driverId
                    const isSelected = selectedDriverId === dId
                    const isFree = d.status === 'AVAILABLE' || d.status === 'ACTIVE' || d.isAvailable
                    return (
                      <div
                        key={dId}
                        onClick={() => setSelectedDriverId(dId)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                          isSelected
                            ? 'bg-taxi-500/10 border-taxi-500 shadow-sm'
                            : 'bg-surface border-border-subtle hover:bg-surface-hover'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-text-primary">{d.name || d.fullName}</p>
                          <p className="text-[10px] text-text-muted">{d.phone || d.phoneNumber || 'N/A'} • {d.vehicleType || 'Sedan'}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          isFree
                            ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20'
                            : 'bg-amber-500/15 text-amber-600 border border-amber-500/20'
                        }`}>
                          {isFree ? 'AVAILABLE' : (d.status || 'BUSY')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
              <Button variant="secondary" onClick={() => setAssignModalTrip(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleManualAssign}
                disabled={!selectedDriverId || actionLoading}
              >
                {actionLoading ? 'Assigning...' : 'Assign Driver'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
