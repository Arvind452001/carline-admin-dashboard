import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, Check, CheckCheck, Trash2, Search, Filter,
  Car, User, AlertTriangle, ShieldCheck, DollarSign,
  Radio, Sparkles, ExternalLink, Clock, Calendar,
  ChevronRight, AlertCircle, XCircle, Eye, EyeOff, RefreshCw
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import { useNotificationStore } from '@/store/notificationStore'

export default function Notifications() {
  const navigate = useNavigate()
  const {
    notifications,
    serverUnreadCount,
    loading,
    error,
    fetchNotifications,
    markRead,
    toggleRead,
    markAllRead,
    removeNotification,
    clearAll
  } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  const showFeedback = (msg) => {
    setFeedbackMsg(msg)
    setTimeout(() => setFeedbackMsg(''), 3000)
  }

  // Calculate Metrics
  const totalCount = notifications.length
  const unreadCount = serverUnreadCount !== null && serverUnreadCount !== undefined
    ? serverUnreadCount
    : notifications.filter((n) => !n.read).length
  const urgentCount = notifications.filter((n) => n.priority === 'urgent' || n.priority === 'high').length
  const tripCount = notifications.filter((n) => n.category === 'trip').length
  const driverCount = notifications.filter((n) => n.category === 'driver').length

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Tab filter
      if (activeTab === 'unread' && n.read) return false
      if (activeTab === 'trip' && n.category !== 'trip') return false
      if (activeTab === 'driver' && n.category !== 'driver') return false
      if (activeTab === 'urgent' && n.priority !== 'urgent' && n.priority !== 'high') return false
      if (activeTab === 'system' && n.category !== 'system' && n.category !== 'payment') return false

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchTitle = n.title?.toLowerCase().includes(query)
        const matchMsg = n.message?.toLowerCase().includes(query)
        const matchRef = n.refId?.toLowerCase().includes(query)
        if (!matchTitle && !matchMsg && !matchRef) return false
      }

      return true
    })
  }, [notifications, activeTab, searchQuery])

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'trip':
        return <Car size={16} />
      case 'driver':
        return <User size={16} />
      case 'alert':
        return <AlertTriangle size={16} />
      case 'payment':
        return <DollarSign size={16} />
      case 'system':
      default:
        return <Radio size={16} />
    }
  }

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'trip':
        return 'bg-blue-50 text-blue-600 border-blue-200/80'
      case 'driver':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200/80'
      case 'alert':
        return 'bg-rose-50 text-rose-600 border-rose-200/80'
      case 'payment':
        return 'bg-teal-50 text-teal-600 border-teal-200/80'
      case 'system':
      default:
        return 'bg-purple-50 text-purple-600 border-purple-200/80'
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Urgent
          </span>
        )
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
            High Priority
          </span>
        )
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase bg-slate-100 text-slate-700 border border-slate-200">
            Normal
          </span>
        )
      case 'info':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase bg-purple-50 text-purple-700 border border-purple-200">
            System
          </span>
        )
    }
  }

  return (
    <PageLayout
      title="Dispatch Alerts & Notifications"
      description="Real-time operations feed of passenger ride requests, driver telemetry, schedule triggers, and cancellations."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={async () => {
              await fetchNotifications()
              showFeedback('Notifications refreshed from server.')
            }}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={CheckCheck}
              onClick={() => {
                markAllRead()
                showFeedback('All notifications marked as read.')
              }}
            >
              Mark All as Read
            </Button>
          )}

          {totalCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              onClick={() => {
                if (window.confirm('Clear all notifications from list?')) {
                  clearAll()
                  showFeedback('All notifications cleared.')
                }
              }}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Clear Feed
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">

        {/* Feedback Toast */}
        {feedbackMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Check size={15} className="text-emerald-600" />
              <span>{feedbackMsg}</span>
            </div>
            <button onClick={() => setFeedbackMsg('')} className="hover:opacity-75 font-bold">✕</button>
          </div>
        )}

        {/* 1. TOP METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface rounded-2xl p-4 border border-border-subtle shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block">Total Alerts</span>
              <p className="text-2xl font-black text-text-primary mt-0.5">{totalCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Bell size={18} />
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-4 border border-border-subtle shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-amber-700 font-bold uppercase tracking-wider block">Unread Alerts</span>
              <p className="text-2xl font-black text-amber-600 mt-0.5">{unreadCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-bold">
              <Clock size={18} />
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-4 border border-border-subtle shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-rose-700 font-bold uppercase tracking-wider block">Urgent / Critical</span>
              <p className="text-2xl font-black text-rose-600 mt-0.5">{urgentCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center font-bold">
              <AlertTriangle size={18} />
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-4 border border-border-subtle shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] text-sky-700 font-bold uppercase tracking-wider block">Trip Dispatches</span>
              <p className="text-2xl font-black text-sky-600 mt-0.5">{tripCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-200/60 flex items-center justify-center font-bold">
              <Car size={18} />
            </div>
          </div>
        </div>

        {/* 2. FILTER & SEARCH CONTROL BAR */}
        <div className="bg-surface rounded-2xl p-3.5 border border-border-subtle shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-surface text-text-primary shadow-xs font-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All Alerts ({totalCount})
            </button>

            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'unread'
                  ? 'bg-surface text-amber-600 shadow-xs font-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('trip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'trip'
                  ? 'bg-surface text-sky-600 shadow-xs font-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Trips ({tripCount})
            </button>

            <button
              onClick={() => setActiveTab('driver')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'driver'
                  ? 'bg-surface text-emerald-600 shadow-xs font-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Drivers ({driverCount})
            </button>

            <button
              onClick={() => setActiveTab('urgent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'urgent'
                  ? 'bg-surface text-rose-600 shadow-xs font-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Urgent ({urgentCount})
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'system'
                  ? 'bg-surface text-purple-600 shadow-xs font-black'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              System
            </button>
          </div>

          {/* Search Field */}
          <div className="w-full md:w-72">
            <Input
              icon={Search}
              placeholder="Search notifications & trip IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs"
            />
          </div>

        </div>

        {/* 3. NOTIFICATION FEED LIST */}
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-xs overflow-hidden divide-y divide-border-subtle/60">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4.5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 group ${
                !n.read ? 'bg-amber-500/[0.04]' : ''
              }`}
            >
              {/* Left Side: Category Icon + Content */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Unread dot */}
                <div className="pt-2.5 shrink-0">
                  <span
                    className={`block h-2.5 w-2.5 rounded-full ${
                      !n.read ? 'bg-taxi-500 ring-4 ring-taxi-500/20 shadow-xs' : 'bg-transparent'
                    }`}
                  />
                </div>

                {/* Category Icon */}
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${getCategoryStyle(n.category)}`}>
                  {getCategoryIcon(n.category)}
                </div>

                {/* Content */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm leading-tight ${!n.read ? 'font-bold text-text-primary' : 'font-semibold text-text-secondary'}`}>
                      {n.title}
                    </h3>

                    {getPriorityBadge(n.priority)}

                    {n.type && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-tight">
                        {n.type.replace(/_/g, ' ')}
                      </span>
                    )}

                    {n.userType && (
                      <span className="text-[10px] font-medium text-text-muted bg-surface-raised px-1.5 py-0.5 rounded border border-border-subtle">
                        {n.userType.replace(/_/g, ' ')}
                      </span>
                    )}

                    {n.refId && (
                      <span className="font-mono text-[11px] font-semibold bg-surface-raised border border-border-subtle px-1.5 py-0.2 rounded text-text-muted">
                        {n.refId}
                      </span>
                    )}
                  </div>

                  {n.message && (
                    <p className="text-xs text-text-muted leading-relaxed">
                      {n.message}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-text-muted pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock size={11} /> {n.time}
                    </span>
                    {n.timestamp && (
                      <span className="hidden md:inline">
                        • {new Date(n.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Quick Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                {n.link && (
                  <Button
                    size="xs"
                    variant="primary"
                    icon={ExternalLink}
                    onClick={() => {
                      markRead(n.id)
                      navigate(n.link)
                    }}
                  >
                    View
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => toggleRead(n.id)}
                  className="p-1.5 rounded-lg border border-border-subtle bg-surface hover:bg-slate-100 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  title={n.read ? 'Mark as unread' : 'Mark as read'}
                >
                  {n.read ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => removeNotification(n.id)}
                  className="p-1.5 rounded-lg border border-border-subtle bg-surface hover:bg-rose-50 text-text-muted hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          ))}

          {/* Loading State */}
          {loading && filteredNotifications.length === 0 && (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-10 h-10 border-3 border-taxi-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-text-muted">Fetching notifications from server...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredNotifications.length === 0 && (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center mx-auto shadow-xs">
                <Bell size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary">No Notifications Found</h4>
                <p className="text-xs text-text-muted mt-0.5 max-w-sm mx-auto">
                  {searchQuery 
                    ? `No notifications matched "${searchQuery}". Try a different keyword.` 
                    : `You have cleared all alerts in the "${activeTab}" filter view.`}
                </p>
              </div>
              {searchQuery && (
                <Button size="xs" variant="secondary" onClick={() => setSearchQuery('')}>
                  Clear Search Filter
                </Button>
              )}
            </div>
          )}
        </div>

      </div>
    </PageLayout>
  )
}
