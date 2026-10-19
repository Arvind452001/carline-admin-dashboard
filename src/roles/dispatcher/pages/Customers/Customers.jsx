import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserPlus,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  Building2,
  Phone,
  Mail,
  Calendar,
  Search as SearchIcon,
  Car,
  AlertCircle,
  Eye,
  ExternalLink,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Receipt,
  XCircle,
  CheckCircle2,
  DollarSign,
  User,
} from 'lucide-react'

import PageLayout from '@/layouts/PageLayout'
import StatusBadge from '@/shared/components/StatusBadge'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'
import Table from '@/shared/components/Table'
import Pagination from '@/shared/components/Pagination'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/shared/services/apiClient'
import { useDebounce } from '@/shared/hooks/useDebounce'

export default function Customers() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)

  // Customer data & company
  const [customers, setCustomers] = useState([])
  const [company, setCompany] = useState(null)

  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    inactive: 0,
    restricted: 0,
  })

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const debouncedSearch = useDebounce(searchQuery, 250)

  // Customer Details Modal & Add Customer Modal
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  })

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    'https://node.aitechnotech.in/carlinee/api/v1'

  const getHeaders = (jsonContent = false) => {
    const headers = {}
    if (jsonContent) headers['Content-Type'] = 'application/json'
    if (token) headers.Authorization = `Bearer ${token}`
    return headers
  }

  // Fetch company customers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
      })
      if (debouncedSearch) {
        params.append('search', debouncedSearch)
      }

      let data = null
      try {
        data = await apiClient.get(`/company/customers/same-company?${params}`)
      } catch {
        const res = await fetch(
          `${baseUrl}/company/customers/same-company?${params}`,
          {
            method: 'GET',
            headers: getHeaders(),
          }
        )
        const json = await res.json()
        if (!res.ok || json?.success === false) {
          throw new Error(json?.message || 'Failed to fetch company customers')
        }
        data = json?.data || {}
      }

      setCompany(data.company || null)

      setCounts({
        all: data.counts?.all ?? (Array.isArray(data.customers) ? data.customers.length : 0),
        active: data.counts?.active ?? 0,
        inactive: data.counts?.inactive ?? 0,
        restricted: data.counts?.restricted ?? 0,
      })

      setCustomers(Array.isArray(data.customers) ? data.customers : [])

      setPagination({
        total: data.pagination?.total ?? (Array.isArray(data.customers) ? data.customers.length : 0),
        page: data.pagination?.page ?? page,
        limit: data.pagination?.limit ?? 10,
        totalPages: Math.max(1, data.pagination?.totalPages ?? 1),
      })
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError(err.message || 'Unable to load customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [token, page, debouncedSearch])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Add a new customer
  const handleAddCustomerSubmit = async (e) => {
    e?.preventDefault()
    if (submitting) return

    if (!newCustomer.firstName.trim() || !newCustomer.phoneNumber.trim()) {
      setErrorMsg('First name and phone number are required.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMsg('')

      const payload = {
        firstName: newCustomer.firstName.trim(),
        lastName: newCustomer.lastName.trim(),
        phoneNumber: newCustomer.phoneNumber.trim(),
        ...(newCustomer.email.trim() ? { email: newCustomer.email.trim() } : {}),
      }

      try {
        await apiClient.post('/company/customers/add', payload)
      } catch {
        const res = await fetch(`${baseUrl}/company/customers/add`, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok || json?.success === false) {
          throw new Error(json?.message || 'Failed to add customer')
        }
      }

      setNewCustomer({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
      })
      setShowAddModal(false)

      if (page !== 1) {
        setPage(1)
      } else {
        await fetchCustomers()
      }
    } catch (err) {
      console.error('Error adding customer:', err)
      setErrorMsg(err.message || 'Network error while adding customer')
    } finally {
      setSubmitting(false)
    }
  }

  // Resolve customer status
  const getCustomerStatus = (customer) => {
    if (customer.status) return customer.status.toLowerCase()
    if (customer.isRestricted === true) return 'restricted'
    if (typeof customer.isActive === 'boolean') return customer.isActive ? 'active' : 'inactive'
    return 'active'
  }

  // Format dates safely
  const formatDate = (value) => {
    if (!value || value === '-') return '—'
    try {
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return String(value)
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return String(value)
    }
  }

  const formatDateTime = (value) => {
    if (!value) return '—'
    try {
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return String(value)
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return String(value)
    }
  }

  // Filter customers by local search & status
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const status = getCustomerStatus(customer).toLowerCase()
      if (statusFilter !== 'all' && status !== statusFilter.toLowerCase()) {
        return false
      }

      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase()
        const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase()
        const name = (customer.name || customer.customer || fullName || '').toLowerCase()
        const phone = (customer.phoneNumber || customer.phone || '').toLowerCase()
        const email = (customer.email || '').toLowerCase()
        const id = (customer.customerId || customer.id || customer._id || '').toLowerCase()

        return (
          name.includes(query) ||
          phone.includes(query) ||
          email.includes(query) ||
          id.includes(query)
        )
      }

      return true
    })
  }, [customers, statusFilter, debouncedSearch])

  // Interactive Stat Cards
  const statCards = [
    {
      label: 'Total Customers',
      value: counts.all,
      icon: Users,
      color: 'text-signal-blue',
      bg: 'bg-signal-blue/10',
      valueColor: 'text-signal-blue',
      filterKey: 'all',
    },
    {
      label: 'Active Riders',
      value: counts.active,
      icon: UserCheck,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      valueColor: 'text-emerald-500',
      filterKey: 'active',
    },
    {
      label: 'Inactive',
      value: counts.inactive,
      icon: UserX,
      color: 'text-text-muted',
      bg: 'bg-slate-500/10',
      valueColor: 'text-text-primary',
      filterKey: 'inactive',
    },
    {
      label: 'Restricted',
      value: counts.restricted,
      icon: ShieldAlert,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      valueColor: 'text-rose-500',
      filterKey: 'restricted',
    },
  ]

  // Filter tabs
  const filterTabs = [
    { key: 'all', label: `All (${counts.all || customers.length})` },
    { key: 'active', label: `Active (${counts.active})` },
    { key: 'inactive', label: `Inactive (${counts.inactive})` },
    { key: 'restricted', label: `Restricted (${counts.restricted})` },
  ]

  // Table columns definition
  const columns = [
    {
      key: 'customer',
      label: 'CUSTOMER',
      render: (r) => {
        const fullName = [r.firstName, r.lastName].filter(Boolean).join(' ')
        const displayName = r.name || fullName || r.customer || 'Unknown Rider'
        const initial = displayName.charAt(0).toUpperCase() || 'C'
        const custId = r.customerId || r.id || r._id

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-taxi-500/20 to-amber-500/10 font-bold text-taxi-500 text-xs border border-taxi-500/20 shadow-xs">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-text-primary truncate text-xs">
                {displayName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StatusBadge status={getCustomerStatus(r)} />
                {custId && (
                  <span className="text-[10px] text-text-muted font-mono truncate max-w-[120px]" title={custId}>
                    ID: {custId.slice(-6)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'contact',
      label: 'CONTACT INFO',
      render: (r) => {
        const phone = r.phoneNumber || r.phone
        return (
          <div className="space-y-0.5">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-1.5 text-xs text-text-primary font-medium hover:text-taxi-500 transition-colors"
                title="Click to call"
              >
                <Phone size={11} className="text-taxi-500 shrink-0" />
                <span>{phone}</span>
              </a>
            ) : (
              <span className="text-text-muted text-xs">—</span>
            )}
            {r.email && (
              <a
                href={`mailto:${r.email}`}
                className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-taxi-500 transition-colors truncate max-w-[170px]"
                title={r.email}
              >
                <Mail size={11} className="text-text-muted shrink-0" />
                <span className="truncate">{r.email}</span>
              </a>
            )}
          </div>
        )
      },
    },
    {
      key: 'trips',
      label: 'TRIP STATS',
      render: (r) => {
        const total = r.totalTrips ?? r.trips ?? 0
        const completed = r.completedTrips ?? 0
        const cancelled = r.cancelledTrips ?? 0

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 font-bold text-xs text-text-primary">
                <Car size={12} className="text-taxi-500 shrink-0" />
                {total} {total === 1 ? 'Trip' : 'Trips'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold" title="Completed rides">
                {completed} done
              </span>
              {cancelled > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-semibold" title="Cancelled rides">
                  {cancelled} canc.
                </span>
              )}
            </div>
          </div>
        )
      },
    },
  
    {
      key: 'joinedAt',
      label: 'REGISTERED ON',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Calendar size={12} className="text-taxi-500 shrink-0" />
          <span>{formatDate(r.joinedAt || r.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      sticky: 'right',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          {/* View Profile Modal */}
          <button
            onClick={() => setSelectedCustomer(r)}
            className="p-1.5 rounded-lg bg-surface hover:bg-surface-hover border border-border-strong text-text-secondary hover:text-text-primary transition-all"
            title="View Full Customer Record"
          >
            <Eye size={13} />
          </button>

          {/* Quick Book Ride for Customer */}
          <button
            onClick={() => {
              const custId = r.customerId || r._id || ''
              const name = r.name || r.customer || ''
              const phone = r.phoneNumber || r.phone || ''
              navigate(`/dispatcher/manual-booking?customerId=${encodeURIComponent(custId)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`)
            }}
            className="px-2.5 py-1 text-xs rounded-lg bg-taxi-500/10 border border-taxi-500/20 text-taxi-500 hover:bg-taxi-500/20 font-semibold flex items-center gap-1 transition-all"
            title="Create a New Booking for this Rider"
          >
            <Sparkles size={11} />
            <span>Book</span>
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageLayout
      title="Customers Directory"
      description="Manage registered company customers, review ride frequency, and book rides on their behalf."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchCustomers}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>

          <Button
            icon={UserPlus}
            onClick={() => {
              setErrorMsg('')
              setShowAddModal(true)
            }}
          >
            Add Customer
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Company Header Card */}
        {company && (
          <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-taxi-500/10 text-taxi-500 border border-taxi-500/20">
                <Building2 size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary">
                    {company.name || 'Company Account'}
                  </h3>
                  {company.code && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised border border-border-subtle text-text-secondary font-bold">
                      {company.code}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Customers registered under this fleet company account
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-muted">Company ID:</span>
              <span className="font-mono px-2.5 py-1 rounded-lg bg-surface border border-border-subtle text-text-primary font-medium">
                {company.id || company._id || 'CMP-003'}
              </span>
            </div>
          </div>
        )}

        {/* Interactive KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((item) => {
            const Icon = item.icon
            const isSelected = statusFilter === item.filterKey
            return (
              <div
                key={item.label}
                onClick={() => setStatusFilter(item.filterKey)}
                className={`glass-card p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-taxi-500 ring-2 ring-taxi-500/20 bg-surface-raised'
                    : 'border-border-subtle hover:border-border-strong'
                }`}
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    {item.label}
                  </p>
                  <p className={`mt-0.5 text-xl font-bold ${item.valueColor}`}>
                    {item.value}
                  </p>
                </div>
                <div className={`rounded-xl p-2.5 ${item.bg}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-rose-500"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="font-bold underline hover:opacity-80"
              onClick={fetchCustomers}
            >
              Retry
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-card p-4 rounded-2xl">
          {/* Search Box */}
          <div className="w-full sm:w-80">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, phone, email, or ID..."
              icon={SearchIcon}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  statusFilter === tab.key
                    ? 'bg-taxi-500 text-black font-bold shadow-xs'
                    : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border-subtle'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customers Table Container */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-xs relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/70 backdrop-blur-xs">
              <div className="flex items-center gap-2 rounded-xl bg-surface px-4 py-2 text-xs font-semibold text-text-primary shadow-lg border border-border-subtle">
                <RefreshCw className="h-4 w-4 animate-spin text-taxi-500" />
                Updating customers...
              </div>
            </div>
          )}

          <Table
            borderless
            columns={columns}
            rows={filteredCustomers}
            keyField="_id"
            emptyLabel={
              searchQuery || statusFilter !== 'all'
                ? 'No customers match your active search or filter'
                : 'No customers registered under this company yet'
            }
          />

          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-text-muted">
                Showing{' '}
                <strong className="text-text-primary">
                  {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </strong>{' '}
                of <strong className="text-text-primary">{pagination.total}</strong> customers
              </p>

              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                onChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* QUICK CUSTOMER PROFILE MODAL */}
      {selectedCustomer && (
        <Modal
          open={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer Record: ${selectedCustomer.name || selectedCustomer.customer}`}
          footer={
            <div className="flex justify-between items-center w-full">
              <span className="text-xs text-text-muted font-mono">
                ID: {selectedCustomer.customerId || selectedCustomer._id}
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setSelectedCustomer(null)}>
                  Close
                </Button>
                <Button
                  icon={Sparkles}
                  onClick={() => {
                    const custId = selectedCustomer.customerId || selectedCustomer._id || ''
                    const name = selectedCustomer.name || selectedCustomer.customer || ''
                    const phone = selectedCustomer.phoneNumber || selectedCustomer.phone || ''
                    setSelectedCustomer(null)
                    navigate(`/dispatcher/manual-booking?customerId=${encodeURIComponent(custId)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`)
                  }}
                >
                  Book Ride
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
            {/* Header / Profile Card */}
            <div className="bg-surface p-3.5 rounded-xl border border-border-subtle flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-taxi-500/20 to-amber-500/10 border border-taxi-500/30 text-taxi-500 flex items-center justify-center font-bold text-base">
                  {(selectedCustomer.name || selectedCustomer.customer || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">
                    {selectedCustomer.name || selectedCustomer.customer}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={getCustomerStatus(selectedCustomer)} />
                    <span className="text-[10px] text-text-muted font-mono">
                      Joined: {formatDate(selectedCustomer.joinedAt || selectedCustomer.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-surface p-3.5 rounded-xl border border-border-subtle space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-text-muted flex items-center gap-1">
                  <Phone size={11} className="text-taxi-500" /> Phone Number
                </span>
                <p className="font-semibold text-text-primary text-xs">
                  {selectedCustomer.phoneNumber || selectedCustomer.phone || '—'}
                </p>
                {(selectedCustomer.phoneNumber || selectedCustomer.phone) && (
                  <a
                    href={`tel:${selectedCustomer.phoneNumber || selectedCustomer.phone}`}
                    className="text-[10px] text-taxi-500 hover:underline block"
                  >
                    Click to initiate call
                  </a>
                )}
              </div>

              <div className="bg-surface p-3.5 rounded-xl border border-border-subtle space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-text-muted flex items-center gap-1">
                  <Mail size={11} className="text-taxi-500" /> Email Address
                </span>
                <p className="font-semibold text-text-primary text-xs truncate">
                  {selectedCustomer.email || '—'}
                </p>
                {selectedCustomer.email && (
                  <a
                    href={`mailto:${selectedCustomer.email}`}
                    className="text-[10px] text-taxi-500 hover:underline block"
                  >
                    Send email
                  </a>
                )}
              </div>
            </div>

            {/* Ride Activity KPI Stats */}
            <div className="grid grid-cols-3 gap-2 bg-surface p-3.5 rounded-xl border border-border-subtle text-center">
              <div>
                <span className="text-[10px] text-text-muted block">Total Rides</span>
                <p className="text-base font-bold text-text-primary mt-0.5">
                  {selectedCustomer.totalTrips ?? selectedCustomer.trips ?? 0}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block">Completed</span>
                <p className="text-base font-bold text-emerald-500 mt-0.5">
                  {selectedCustomer.completedTrips ?? 0}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block">Cancelled</span>
                <p className="text-base font-bold text-rose-500 mt-0.5">
                  {selectedCustomer.cancelledTrips ?? 0}
                </p>
              </div>
            </div>

            {/* Last Trip Details Card */}
            <div className="bg-surface p-3.5 rounded-xl border border-border-subtle space-y-2.5">
              <span className="text-[10px] font-bold uppercase text-text-muted flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Car size={11} className="text-taxi-500" /> Recent Trip Activity
                </span>
                {selectedCustomer.lastTripDetails?.rideId && (
                  <button
                    onClick={() => {
                      const rideId = selectedCustomer.lastTripDetails.rideId
                      setSelectedCustomer(null)
                      navigate(`/dispatcher/trip-details?tripId=${encodeURIComponent(rideId)}`)
                    }}
                    className="text-taxi-500 hover:underline flex items-center gap-1 font-semibold text-[10px]"
                  >
                    <span>View Trip</span>
                    <ExternalLink size={9} />
                  </button>
                )}
              </span>

              {selectedCustomer.lastTripDetails ? (
                <div className="space-y-2 pt-1 border-t border-border-subtle/60 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted text-[11px]">
                      Date: <strong>{formatDateTime(selectedCustomer.lastTripDetails.date)}</strong>
                    </span>
                    <span className="text-sm font-bold text-emerald-500">
                      {selectedCustomer.currency || '$'}{selectedCustomer.lastTripDetails.fare ?? 0}
                    </span>
                  </div>

                  <div className="space-y-1 bg-surface-raised p-2.5 rounded-lg border border-border-subtle text-[11px]">
                    <div className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-[9px] text-text-muted uppercase block font-semibold">Pickup</span>
                        <p className="text-text-primary">{selectedCustomer.lastTripDetails.pickup || 'Pickup location'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5 pt-1 border-t border-border-subtle/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-[9px] text-text-muted uppercase block font-semibold">Dropoff</span>
                        <p className="text-text-primary">{selectedCustomer.lastTripDetails.dropoff || 'Dropoff location'}</p>
                      </div>
                    </div>
                  </div>

                  {selectedCustomer.lastTripDetails.status && (
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                      <span>Status:</span>
                      <span className="font-semibold text-text-primary uppercase">
                        {selectedCustomer.lastTripDetails.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-text-muted py-2 text-center text-xs">
                  {selectedCustomer.lastTrip && selectedCustomer.lastTrip !== '-'
                    ? `Last active: ${selectedCustomer.lastTrip}`
                    : 'No trip records found for this customer.'}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ADD CUSTOMER MODAL */}
      <Modal
        open={showAddModal}
        onClose={() => {
          if (!submitting) {
            setShowAddModal(false)
            setErrorMsg('')
          }
        }}
        title="Register New Customer"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false)
                setErrorMsg('')
              }}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              icon={UserPlus}
              onClick={handleAddCustomerSubmit}
              disabled={submitting}
            >
              {submitting ? 'Registering...' : 'Register Customer'}
            </Button>
          </>
        }
      >
        <form
          id="add-customer-form"
          onSubmit={handleAddCustomerSubmit}
          className="space-y-4"
        >
          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-rose-500 flex items-center gap-2"
            >
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="First Name *"
              required
              value={newCustomer.firstName}
              onChange={(e) =>
                setNewCustomer((prev) => ({
                  ...prev,
                  firstName: e.target.value,
                }))
              }
              placeholder="e.g. John"
            />

            <Input
              label="Last Name"
              value={newCustomer.lastName}
              onChange={(e) =>
                setNewCustomer((prev) => ({
                  ...prev,
                  lastName: e.target.value,
                }))
              }
              placeholder="e.g. Smith"
            />
          </div>

          <Input
            label="Phone Number *"
            required
            value={newCustomer.phoneNumber}
            onChange={(e) =>
              setNewCustomer((prev) => ({
                ...prev,
                phoneNumber: e.target.value,
              }))
            }
            placeholder="e.g. +1 555-0199"
          />

          <Input
            label="Email Address"
            type="email"
            value={newCustomer.email}
            onChange={(e) =>
              setNewCustomer((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            placeholder="e.g. john.smith@example.com"
          />
        </form>
      </Modal>
    </PageLayout>
  )
}
