import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, Radio, Clock, Grid, AlertCircle, AlertTriangle, RefreshCw, 
  Calendar, CheckCircle2, Car, MapPin, Phone, User, Sparkles, UserCheck, 
  XCircle, Navigation, ExternalLink, ArrowRight, ShieldCheck, ChevronRight, Activity,
  Zap, Compass, TrendingUp, DollarSign, Eye, Users, FileText, Mail
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Modal from '@/shared/components/Modal'
import { dispatcherApi } from '../../services/dispatcherApi'
import { apiClient } from '@/shared/services/apiClient'

export default function Dashboard() {
  const navigate = useNavigate()
  const [timeFilter, setTimeFilter] = useState('Today')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'pending' | 'live' | 'scheduled' | 'drivers'
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [lastUpdated, setLastUpdated] = useState(new Date())

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
  const [selectedDriverProfile, setSelectedDriverProfile] = useState(null)

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
        allTripsRes,
        companyDriversRes
      ] = await Promise.allSettled([
        dispatcherApi.getStats(),
        dispatcherApi.getPendingTrips({ limit: 15 }),
        dispatcherApi.getLiveTrips(),
        dispatcherApi.getScheduledTrips({ limit: 10 }),
        dispatcherApi.getCompletedTrips({ limit: 10 }),
        dispatcherApi.getCancelledTrips({ limit: 10 }),
        dispatcherApi.getLiveMap(),
        dispatcherApi.getTrips({ limit: 30 }),
        apiClient.get('/driver/company-drivers/all?limit=50')
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

      // 6. Process Drivers from Company Drivers API or Live Map
      let driverList = []
      if (companyDriversRes.status === 'fulfilled') {
        const raw = companyDriversRes.value
        driverList = raw?.drivers || raw?.data?.drivers || (Array.isArray(raw) ? raw : [])
      }
      if (driverList.length === 0 && mapRes.status === 'fulfilled') {
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

      setLastUpdated(new Date())
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
      await dispatcherApi.autoAssignDriver(trip.id)
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
        title: 'Unassigned Bookings In Queue',
        details: `${stats.unassignedTrips} trip request${stats.unassignedTrips > 1 ? 's' : ''} awaiting immediate driver dispatch.`,
        actionText: 'Dispatch Queue',
        onClick: () => navigate('/dispatcher/pending-trips'),
        icon: AlertTriangle,
      })
    }
    if (stats.driversAvailable === 0 && stats.pendingTrips > 0) {
      list.push({
        id: 'driver-shortage',
        type: 'warning',
        title: 'Fleet Capacity Warning',
        details: 'No available drivers online while active trip requests are waiting.',
        actionText: 'Driver Map',
        onClick: () => navigate('/dispatcher/maps'),
        icon: AlertCircle,
      })
    }
    if (stats.activeTrips > 0) {
      list.push({
        id: 'active-trips-status',
        type: 'info',
        title: 'Live Trips In Transit',
        details: `${stats.activeTrips} active vehicle${stats.activeTrips > 1 ? 's' : ''} currently on route with passengers.`,
        actionText: 'Live GPS Map',
        onClick: () => navigate('/dispatcher/live-trips'),
        icon: Radio,
      })
    }
    if (list.length === 0) {
      list.push({
        id: 'all-clear',
        type: 'success',
        title: 'Fleet Operations Optimal',
        details: `${stats.driversAvailable} drivers available across active zones. All rides dispatched on time.`,
        actionText: 'Dispatch Board',
        onClick: () => navigate('/dispatcher/dispatch-board'),
        icon: ShieldCheck,
      })
    }
    return list
  }, [stats, navigate])

  return (
    <PageLayout
      title="Dispatcher Operations Command"
      description="Real-time multi-feed overview of bookings, active trips, fleet availability, and dispatch queues."
      actions={
        <div className="flex items-center gap-2.5">
          {/* Live indicator badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Sync</span>
            <span className="text-[10px] text-emerald-600/70 border-l border-emerald-200/80 pl-1.5">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* Time Filter Select */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="rounded-xl border border-border-subtle bg-surface px-3 py-2 text-xs font-semibold text-text-primary focus:border-taxi-500 focus:outline-none cursor-pointer shadow-xs hover:border-slate-300 transition-colors"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>All Time</option>
          </select>

          {/* Refresh Button */}
          <Button 
            variant="secondary" 
            icon={RefreshCw} 
            onClick={fetchAllDashboardData} 
            disabled={loading}
            className="text-xs font-semibold shadow-xs"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>

          {/* New Booking CTA */}
          <Button 
            icon={Plus} 
            onClick={() => navigate('/dispatcher/manual-booking')}
            className="text-xs font-bold shadow-md shadow-taxi-500/25 bg-gradient-to-r from-taxi-500 to-amber-600 hover:from-taxi-400 hover:to-amber-500"
          >
            New Booking
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner Messages */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={15} />
              </div>
              <span className="font-semibold text-emerald-900">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors font-bold">✕</button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-lg bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle size={15} />
              </div>
              <span className="font-semibold text-rose-900">{error}</span>
            </div>
            <button onClick={fetchAllDashboardData} className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors">Retry</button>
          </div>
        )}

        {/* 1. TOP OPERATIONAL KPI METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Pending */}
          <div 
            onClick={() => navigate('/dispatcher/pending-trips')}
            className="rounded-2xl p-4 cursor-pointer group flex flex-col justify-between border border-amber-200/70 hover:border-amber-400 bg-gradient-to-b from-amber-500/[0.07] via-surface to-surface hover:shadow-md transition-all shadow-xs relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] text-amber-700/80 font-bold uppercase tracking-wider">Pending Dispatch</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <Clock size={14} />
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-1">
                <p className="text-3xl font-black tracking-tight text-amber-600">{stats.pendingTrips}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  stats.pendingTrips > 0 
                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {stats.pendingTrips > 0 ? `${stats.pendingTrips} Awaiting` : 'Queue Clear'}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-amber-100/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted">Unassigned:</span>
                <strong className={stats.unassignedTrips > 0 ? 'text-rose-600' : 'text-text-secondary'}>
                  {stats.unassignedTrips} trips
                </strong>
              </div>
              <div className="flex items-center justify-between text-[10px] text-amber-700 font-semibold pt-0.5">
                <span>Dispatch Queue</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2: Live / Active */}
          <div 
            onClick={() => navigate('/dispatcher/live-trips')}
            className="rounded-2xl p-4 cursor-pointer group flex flex-col justify-between border border-sky-200/70 hover:border-sky-400 bg-gradient-to-b from-sky-500/[0.07] via-surface to-surface hover:shadow-md transition-all shadow-xs relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-sky-600" />
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] text-sky-700/80 font-bold uppercase tracking-wider">Active Rides</span>
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all">
                  <Radio size={14} className={stats.activeTrips > 0 ? 'animate-pulse' : ''} />
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-1">
                <p className="text-3xl font-black tracking-tight text-sky-600">{stats.activeTrips}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping" />
                  On Road
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-sky-100/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted">Status:</span>
                <strong className="text-sky-700">GPS Live Sync</strong>
              </div>
              <div className="flex items-center justify-between text-[10px] text-sky-700 font-semibold pt-0.5">
                <span>Live Map Radar</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 3: Scheduled */}
          <div 
            onClick={() => navigate('/dispatcher/scheduled-trips')}
            className="rounded-2xl p-4 cursor-pointer group flex flex-col justify-between border border-purple-200/70 hover:border-purple-400 bg-gradient-to-b from-purple-500/[0.07] via-surface to-surface hover:shadow-md transition-all shadow-xs relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] text-purple-700/80 font-bold uppercase tracking-wider">Scheduled</span>
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <Calendar size={14} />
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-1">
                <p className="text-3xl font-black tracking-tight text-purple-600">{stats.scheduledTrips}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Advance
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-purple-100/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted">Timing:</span>
                <strong className="text-purple-700">Next Upcoming</strong>
              </div>
              <div className="flex items-center justify-between text-[10px] text-purple-700 font-semibold pt-0.5">
                <span>View Bookings</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 4: Completed */}
          <div 
            onClick={() => navigate('/dispatcher/completed-trips')}
            className="rounded-2xl p-4 cursor-pointer group flex flex-col justify-between border border-emerald-200/70 hover:border-emerald-400 bg-gradient-to-b from-emerald-500/[0.07] via-surface to-surface hover:shadow-md transition-all shadow-xs relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] text-emerald-700/80 font-bold uppercase tracking-wider">Completed</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <CheckCircle2 size={14} />
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-1">
                <p className="text-3xl font-black tracking-tight text-emerald-600">{stats.completedToday}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Rate
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-emerald-100/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted">Total GMV:</span>
                <strong className="text-emerald-700">${stats.totalGMV.toLocaleString()}</strong>
              </div>
              <div className="flex items-center justify-between text-[10px] text-emerald-700 font-semibold pt-0.5">
                <span>Revenue Logs</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 5: Fleet Online */}
          <div 
            onClick={() => navigate('/dispatcher/drivers')}
            className="rounded-2xl p-4 cursor-pointer group flex flex-col justify-between border border-orange-200/70 hover:border-orange-400 bg-gradient-to-b from-orange-500/[0.07] via-surface to-surface hover:shadow-md transition-all shadow-xs relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-taxi-500" />
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] text-orange-700/80 font-bold uppercase tracking-wider">Fleet Online</span>
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-taxi-600 border border-orange-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-taxi-500 group-hover:text-white transition-all">
                  <Car size={14} />
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-1">
                <p className="text-3xl font-black tracking-tight text-text-primary">{stats.driversOnline}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {stats.driversAvailable} Free
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-orange-100/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted">On Job / Busy:</span>
                <strong className="text-text-secondary">{stats.driversBusy || (stats.driversOnline - stats.driversAvailable > 0 ? stats.driversOnline - stats.driversAvailable : 0)} drivers</strong>
              </div>
              <div className="flex items-center justify-between text-[10px] text-taxi-600 font-semibold pt-0.5">
                <span>Fleet Drivers</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 6: Cancelled */}
          <div 
            onClick={() => navigate('/dispatcher/cancelled-trips')}
            className="rounded-2xl p-4 cursor-pointer group flex flex-col justify-between border border-rose-200/70 hover:border-rose-400 bg-gradient-to-b from-rose-500/[0.07] via-surface to-surface hover:shadow-md transition-all shadow-xs relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-rose-600" />
            <div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-[10px] text-rose-700/80 font-bold uppercase tracking-wider">Cancelled</span>
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <XCircle size={14} />
                </div>
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-1">
                <p className="text-3xl font-black tracking-tight text-rose-500">{stats.cancelledTrips}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Voided
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-rose-100/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted">Cancellation:</span>
                <strong className="text-rose-600">
                  {Math.round((stats.cancelledTrips / Math.max(stats.completedToday + stats.cancelledTrips, 1)) * 100)}%
                </strong>
              </div>
              <div className="flex items-center justify-between text-[10px] text-rose-600 font-semibold pt-0.5">
                <span>Audit Log</span>
                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. OPERATIONS CONTROL BAR & QUICK SHORTCUTS */}
        <div className="bg-surface rounded-2xl p-3 border border-border-subtle shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                activeTab === 'all'
                  ? 'bg-white text-text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All Operations
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === 'pending'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>Pending Queue</span>
              {pendingTrips.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-white font-extrabold">
                  {pendingTrips.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === 'live'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>Live Rides</span>
              {liveTrips.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-sky-500 text-white font-extrabold">
                  {liveTrips.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === 'scheduled'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>Scheduled</span>
              {scheduledTrips.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-purple-500 text-white font-extrabold">
                  {scheduledTrips.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === 'drivers'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>Fleet Drivers</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500 text-white font-extrabold">
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
              className="text-xs font-semibold shadow-xs hover:border-taxi-500/40"
            >
              Dispatch Board
            </Button>
            <Button
              size="xs"
              variant="secondary"
              icon={Navigation}
              onClick={() => navigate('/dispatcher/maps')}
              className="text-xs font-semibold shadow-xs hover:border-taxi-500/40"
            >
              Live Driver Map
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
                className="bg-surface hover:bg-slate-50 p-4 rounded-2xl border border-border-subtle hover:border-slate-300 transition-all cursor-pointer flex items-start gap-3.5 shadow-xs group"
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  a.type === 'danger'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                    : a.type === 'warning'
                    ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                    : a.type === 'info'
                    ? 'bg-sky-50 text-sky-600 border border-sky-200/60'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
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
          <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <span>Pending Dispatch Queue</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                      {pendingTrips.length} Awaiting Driver
                    </span>
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">Real-time matching and manual assignment queue for newly placed bookings</p>
                </div>
              </div>
              <Button
                size="xs"
                variant="secondary"
                icon={ArrowRight}
                onClick={() => navigate('/dispatcher/pending-trips')}
                className="self-start sm:self-auto text-xs font-semibold"
              >
                View Full Queue
              </Button>
            </div>

            {loading && pendingTrips.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin text-taxi-500" />
                <span>Loading latest dispatch requests...</span>
              </div>
            ) : pendingTrips.length === 0 ? (
              <div className="py-10 text-center rounded-2xl bg-slate-50/60 border border-dashed border-border-subtle">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                  <ShieldCheck size={24} />
                </div>
                <p className="text-sm font-bold text-text-primary">All Bookings Successfully Dispatched!</p>
                <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">There are currently no passenger ride requests waiting for driver assignment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase font-bold tracking-wider bg-slate-50/50">
                      <th className="py-3 px-3.5 rounded-l-lg">Trip ID</th>
                      <th className="py-3 px-3.5">Customer</th>
                      <th className="py-3 px-3.5">Route</th>
                      <th className="py-3 px-3.5">Vehicle</th>
                      <th className="py-3 px-3.5">Fare</th>
                      <th className="py-3 px-3.5 text-right rounded-r-lg">Quick Dispatch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {pendingTrips.slice(0, 6).map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3.5">
                          <span className="font-extrabold text-text-primary font-mono text-xs">{t.tripId}</span>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </p>
                        </td>
                        <td className="py-3.5 px-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 border border-border-subtle">
                              {(t.customer?.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-text-primary">{t.customer?.name || 'Customer'}</p>
                              {t.customer?.phone && (
                                <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                                  <Phone size={9} /> {t.customer.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 max-w-[260px]">
                          <div className="space-y-1">
                            <p className="text-text-primary truncate font-semibold flex items-center gap-1.5" title={t.pickup?.address}>
                              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="truncate">{t.pickup?.address || 'Pickup Point'}</span>
                            </p>
                            <p className="text-text-secondary truncate text-[11px] flex items-center gap-1.5" title={t.dropoff?.address}>
                              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                              <span className="truncate">{t.dropoff?.address || 'Destination Point'}</span>
                            </p>
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200">
                            <Car size={12} className="text-taxi-500" />
                            {t.driver?.vehicleType || t.vehicleTypeName || 'Standard Sedan'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-extrabold text-xs border border-amber-200">
                            {t.fare?.amount != null ? `$${t.fare.amount}` : '$0'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAutoAssign(t)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-taxi-500 to-amber-600 hover:from-taxi-400 hover:to-amber-500 text-white text-xs font-bold shadow-xs hover:shadow flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
                              title="Auto Match nearest driver"
                            >
                              <Sparkles size={13} />
                              <span>Auto</span>
                            </button>
                            <button
                              onClick={() => openAssignModal(t)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-surface hover:bg-slate-100 border border-border-strong text-text-primary text-xs font-semibold shadow-xs hover:shadow flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
                              title="Manually assign driver"
                            >
                              <UserCheck size={13} className="text-taxi-500" />
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
              <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-200/60 flex items-center justify-center shrink-0">
                        <Radio size={18} className={liveTrips.length > 0 ? 'animate-pulse' : ''} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-primary">Live Trips In Transit</h3>
                        <p className="text-xs text-text-muted mt-0.5">{liveTrips.length} active vehicle{liveTrips.length !== 1 ? 's' : ''} on the road</p>
                      </div>
                    </div>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => navigate('/dispatcher/live-trips')}
                      className="text-xs font-semibold"
                    >
                      Track All
                    </Button>
                  </div>

                  {liveTrips.length === 0 ? (
                    <div className="py-14 text-center text-xs text-text-muted">
                      <Activity size={28} className="mx-auto mb-2 text-sky-400 opacity-60" />
                      <p className="font-semibold text-text-primary">No active rides on route at this moment.</p>
                      <p className="text-[11px] text-text-muted mt-0.5">Trips currently in transit will appear here with live metrics.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto pr-1">
                      {liveTrips.slice(0, 5).map((trip) => (
                        <div 
                          key={trip.id}
                          onClick={() => navigate('/dispatcher/live-trips')}
                          className="bg-slate-50/70 hover:bg-slate-100/80 p-4 rounded-xl border border-border-subtle hover:border-sky-300 transition-all cursor-pointer space-y-2.5"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-text-primary text-xs font-mono">{trip.tripId}</span>
                              <span className="text-[11px] text-text-muted ml-2">
                                • Driver: <strong className="text-text-primary">{trip.driver?.name || 'Assigned'}</strong>
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 uppercase flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping"></span>
                              In Transit
                            </span>
                          </div>

                          <div className="text-xs text-text-secondary space-y-0.5">
                            <p className="truncate flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="truncate">{trip.pickup?.address || 'Pickup'}</span>
                            </p>
                            <p className="truncate flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                              <span className="truncate">{trip.dropoff?.address || 'Dropoff'}</span>
                            </p>
                          </div>

                          <div className="flex justify-between items-center text-[11px] text-text-muted pt-2 border-t border-border-subtle">
                            <span>Passenger: <strong className="text-text-primary">{trip.customer?.name || 'Guest'}</strong></span>
                            <span className="font-extrabold text-taxi-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">${trip.fare?.amount || 0}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <Button 
                    variant="secondary" 
                    icon={Navigation}
                    onClick={() => navigate('/dispatcher/live-trips')} 
                    className="w-full justify-center text-xs font-semibold"
                  >
                    Open Live GPS Map Tracker
                  </Button>
                </div>
              </div>
            )}

            {/* Right: Company Drivers / Fleet Online Status */}
            {(activeTab === 'all' || activeTab === 'drivers') && (
              <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                        <Car size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-primary">Fleet Drivers Status</h3>
                        <p className="text-xs text-text-muted mt-0.5">
                          {stats.driversAvailable} of {drivers.length || stats.driversOnline} Available for Trips
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="xs"
                        variant="secondary"
                        icon={Users}
                        onClick={() => navigate('/dispatcher/drivers')}
                        className="text-xs font-semibold"
                      >
                        All Drivers
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        icon={Compass}
                        onClick={() => navigate('/dispatcher/maps')}
                        className="text-xs font-semibold"
                      >
                        Map
                      </Button>
                    </div>
                  </div>

                  {drivers.length === 0 ? (
                    <div className="py-14 text-center text-xs text-text-muted">
                      <Car size={28} className="mx-auto mb-2 text-emerald-400 opacity-60" />
                      <p className="font-semibold text-text-primary">No driver fleet data loaded.</p>
                      <p className="text-[11px] text-text-muted mt-0.5">Active company drivers will show availability status here.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 mt-4 max-h-[400px] overflow-y-auto pr-1">
                      {drivers.slice(0, 6).map((drv) => {
                        const dId = drv.id || drv._id || drv.driverId
                        const dName = drv.name || drv.fullName || 'Driver'
                        const isFree = drv.status === 'AVAILABLE' || drv.status === 'ACTIVE' || drv.isAvailable
                        const isOnTrip = drv.status === 'ON_TRIP' || drv.status === 'BUSY' || drv.status === 'RIDING' || drv.status === 'ONGOING'
                        return (
                          <div 
                            key={dId}
                            onClick={() => setSelectedDriverProfile(drv)}
                            className="p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/90 border border-border-subtle hover:border-taxi-500/40 flex justify-between items-center transition-all cursor-pointer group shadow-2xs"
                            title="Click to view driver profile & full details"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-taxi-500/15 text-taxi-600 border border-taxi-500/20 flex items-center justify-center text-xs font-bold shrink-0">
                                {dName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-text-primary group-hover:text-taxi-600 transition-colors">{dName}</h4>
                                  <Eye size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-[11px] text-text-muted">
                                  {drv.make ? `${drv.make} • ` : ''}{drv.vehicleType || 'Sedan'} {drv.vehicleRegistrationNumber ? `(${drv.vehicleRegistrationNumber})` : ''} {drv.phone || drv.phoneNumber ? `• ${drv.phone || drv.phoneNumber}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase flex items-center gap-1.5 ${
                                isFree
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isOnTrip
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isFree ? 'bg-emerald-500' : isOnTrip ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                                {isFree ? 'AVAILABLE' : (isOnTrip ? 'ON TRIP' : (drv.status || 'OFFLINE'))}
                              </span>
                              <ChevronRight size={14} className="text-text-muted group-hover:translate-x-0.5 group-hover:text-taxi-500 transition-all" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-3 flex gap-2">
                  <Button 
                    variant="secondary" 
                    icon={Users}
                    onClick={() => navigate('/dispatcher/drivers')} 
                    className="flex-1 justify-center text-xs font-semibold"
                  >
                    Driver Profiles Directory
                  </Button>
                  <Button 
                    variant="secondary" 
                    icon={Grid}
                    onClick={() => navigate('/dispatcher/dispatch-board')} 
                    className="flex-1 justify-center text-xs font-semibold"
                  >
                    Open Dispatch Board
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- SECTION C: SCHEDULED ADVANCE BOOKINGS --- */}
        {(activeTab === 'all' || activeTab === 'scheduled') && (
          <div className="bg-surface rounded-2xl p-6 border border-border-subtle shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Upcoming Scheduled Bookings</h3>
                  <p className="text-xs text-text-muted mt-0.5">Advance ride reservations and upcoming automated dispatch runs</p>
                </div>
              </div>
              <Button
                size="xs"
                variant="secondary"
                onClick={() => navigate('/dispatcher/scheduled-trips')}
                className="text-xs font-semibold"
              >
                View All Scheduled
              </Button>
            </div>

            {scheduledTrips.length === 0 ? (
              <div className="py-10 text-center text-xs text-text-muted bg-slate-50/50 rounded-xl border border-dashed border-border-subtle">
                <Calendar size={24} className="mx-auto mb-1.5 text-purple-400 opacity-60" />
                <p className="font-semibold text-text-primary">No advance scheduled bookings for today.</p>
                <p className="text-[11px] text-text-muted mt-0.5">Future booked rides will automatically pop up here before dispatch.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {scheduledTrips.slice(0, 6).map((trip) => (
                  <div 
                    key={trip.id}
                    onClick={() => navigate('/dispatcher/scheduled-trips')}
                    className="bg-slate-50/70 hover:bg-slate-100/80 p-4 rounded-xl border border-border-subtle hover:border-purple-300 transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs font-mono text-text-primary">{trip.tripId}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {trip.scheduledAt ? new Date(trip.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Upcoming'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-text-primary">{trip.customer?.name || 'Customer'}</p>
                    <p className="text-[11px] text-text-secondary truncate">
                      📍 {trip.pickup?.address || 'Pickup'} → {trip.dropoff?.address || 'Destination'}
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-border-subtle text-[11px] text-text-muted">
                      <span>Vehicle: <strong className="text-text-primary">{trip.driver?.vehicleType || 'Standard'}</strong></span>
                      <span className="font-extrabold text-taxi-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">${trip.fare?.amount || 0}</span>
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
            <div className="p-4 bg-slate-50 rounded-xl border border-border-subtle space-y-1.5">
              <p className="font-bold text-text-primary">Trip Details:</p>
              <p className="text-text-secondary">Customer: <strong>{assignModalTrip.customer?.name || 'Guest'}</strong> • Vehicle: <strong>{assignModalTrip.driver?.vehicleType || 'Standard Sedan'}</strong></p>
              <p className="text-text-secondary truncate">Route: {assignModalTrip.pickup?.address} → {assignModalTrip.dropoff?.address}</p>
              <p className="text-taxi-600 font-extrabold text-sm">Estimated Fare: ${assignModalTrip.fare?.amount || 0}</p>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-2">Select Available Company Driver:</label>
              {drivers.length === 0 ? (
                <p className="text-text-muted italic py-4 text-center">No drivers loaded in active fleet.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {drivers.map((d) => {
                    const dId = d.id || d._id || d.driverId
                    const isSelected = selectedDriverId === dId
                    const isFree = d.status === 'AVAILABLE' || d.status === 'ACTIVE' || d.isAvailable
                    return (
                      <div
                        key={dId}
                        onClick={() => setSelectedDriverId(dId)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                          isSelected
                            ? 'bg-taxi-500/10 border-taxi-500 shadow-xs ring-1 ring-taxi-500/20'
                            : 'bg-surface border-border-subtle hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-xs flex items-center justify-center border border-border-subtle">
                            {(d.name || d.fullName || 'D').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary">{d.name || d.fullName}</p>
                            <p className="text-[10px] text-text-muted">{d.phone || d.phoneNumber || 'N/A'} • {d.vehicleType || 'Sedan'}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase flex items-center gap-1 ${
                          isFree
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isFree ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {isFree ? 'AVAILABLE' : (d.status || 'BUSY')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-border-subtle">
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

      {/* DRIVER PROFILE MODAL */}
      {selectedDriverProfile && (
        <Modal
          open={true}
          isOpen={true}
          onClose={() => setSelectedDriverProfile(null)}
          title={`Driver Profile: ${selectedDriverProfile.fullName || selectedDriverProfile.name}`}
        >
          <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Header with avatar, status, role */}
            <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 border border-border-subtle">
              <div className="w-14 h-14 rounded-xl bg-taxi-500/15 text-taxi-600 border border-taxi-500/20 flex items-center justify-center text-xl font-bold shrink-0">
                {(selectedDriverProfile.fullName || selectedDriverProfile.name || 'D').charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-text-primary truncate">
                    {selectedDriverProfile.fullName || selectedDriverProfile.name}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    (selectedDriverProfile.status === 'AVAILABLE' || selectedDriverProfile.status === 'ACTIVE' || selectedDriverProfile.isAvailable)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : (selectedDriverProfile.status === 'ON_TRIP' || selectedDriverProfile.status === 'BUSY')
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {selectedDriverProfile.status || 'ACTIVE'}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Company Fleet Driver • {selectedDriverProfile.preferredServiceArea ? `Zone: ${selectedDriverProfile.preferredServiceArea}` : 'All Zones'}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                  {(selectedDriverProfile.phoneNumber || selectedDriverProfile.phone) && (
                    <a href={`tel:${selectedDriverProfile.phoneNumber || selectedDriverProfile.phone}`} className="text-taxi-600 font-bold hover:underline flex items-center gap-1">
                      <Phone size={11} /> {selectedDriverProfile.phoneNumber || selectedDriverProfile.phone}
                    </a>
                  )}
                  {selectedDriverProfile.email && (
                    <span className="flex items-center gap-1 truncate text-text-muted">
                      <Mail size={11} /> {selectedDriverProfile.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle & License Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-border-subtle bg-white space-y-2">
                <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5 border-b border-border-subtle pb-1.5">
                  <Car size={14} className="text-taxi-500" /> Vehicle Information
                </h4>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span className="text-text-muted">Class / Type:</span>
                    <span className="font-semibold text-text-primary">{selectedDriverProfile.vehicleType || 'Sedan'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span className="text-text-muted">Registration Plate:</span>
                    <span className="font-mono font-bold text-text-primary">{selectedDriverProfile.vehicleRegistrationNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span className="text-text-muted">Make & Model:</span>
                    <span className="font-semibold text-text-primary">{selectedDriverProfile.make ? `${selectedDriverProfile.make} ${selectedDriverProfile.modelAndYear || ''}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-text-muted">Fuel / Transmission:</span>
                    <span className="font-semibold text-text-primary">{selectedDriverProfile.fuelType || 'Petrol'} • {selectedDriverProfile.transmission || 'Manual'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border-subtle bg-white space-y-2">
                <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5 border-b border-border-subtle pb-1.5">
                  <FileText size={14} className="text-sky-500" /> License & Duty Status
                </h4>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span className="text-text-muted">License Number:</span>
                    <span className="font-mono font-bold text-text-primary">{selectedDriverProfile.licenseNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span className="text-text-muted">License Class:</span>
                    <span className="font-semibold text-text-primary">{selectedDriverProfile.licenseClass || 'Commercial'}</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span className="text-text-muted">Expiry Date:</span>
                    <span className="font-semibold text-text-primary">{selectedDriverProfile.expiryDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-text-muted">Online / Duty:</span>
                    <span className="font-semibold text-emerald-600">{selectedDriverProfile.isOnline ? 'Online on GPS' : 'Offline'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            {(selectedDriverProfile.licenseCopyUrl || selectedDriverProfile.vehicleRegistrationDocUrl || selectedDriverProfile.insuranceProofUrl || selectedDriverProfile.governmentIdUrl) && (
              <div className="p-3 rounded-xl border border-border-subtle bg-white space-y-2">
                <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5 border-b border-border-subtle pb-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" /> Documents on File
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                  {[
                    { label: 'License Copy', url: selectedDriverProfile.licenseCopyUrl },
                    { label: 'Vehicle Registration', url: selectedDriverProfile.vehicleRegistrationDocUrl },
                    { label: 'Insurance Proof', url: selectedDriverProfile.insuranceProofUrl },
                    { label: 'Govt. ID', url: selectedDriverProfile.governmentIdUrl },
                  ].map((doc) => doc.url ? (
                    <a key={doc.label} href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-50 border border-border-subtle hover:bg-slate-100 block transition-colors">
                      <span className="font-semibold block truncate">{doc.label}</span>
                      <span className="text-taxi-600 font-bold block mt-1">View File ↗</span>
                    </a>
                  ) : null)}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-border-subtle">
              <Button
                size="sm"
                variant="secondary"
                icon={Compass}
                onClick={() => {
                  setSelectedDriverProfile(null)
                  navigate('/dispatcher/maps')
                }}
              >
                Find on Map
              </Button>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setSelectedDriverProfile(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => {
                    const dId = selectedDriverProfile._id || selectedDriverProfile.id
                    setSelectedDriverProfile(null)
                    navigate(`/dispatcher/drivers/${dId}`)
                  }}
                >
                  Full Profile Page
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </PageLayout>
  )
}
