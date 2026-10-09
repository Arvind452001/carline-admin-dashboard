import { useState, useEffect, useCallback, useMemo } from 'react'
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
} from 'lucide-react'

import PageLayout from '@/layouts/PageLayout'
import StatusBadge from '@/shared/components/StatusBadge'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'
import Table from '@/shared/components/Table'
import { useAuthStore } from '@/store/authStore'
import { useDebounce } from '@/shared/hooks/useDebounce'

export default function Customers() {
  const token = useAuthStore((s) => s.token)

  // Customer data
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
    totalPages: 0,
  })

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const debouncedSearch = useDebounce(searchQuery, 250)

  // Add customer modal
  const [showModal, setShowModal] = useState(false)
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

    if (jsonContent) {
      headers['Content-Type'] = 'application/json'
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

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

      const res = await fetch(
        `${baseUrl}/company/customers/same-company?${params}`,
        {
          method: 'GET',
          headers: getHeaders(),
        }
      )

      const json = await res.json()

      if (!res.ok || json?.success === false) {
        throw new Error(
          json?.message || 'Failed to fetch company customers'
        )
      }

      const data = json?.data || {}

      setCompany(data.company || null)

      setCounts({
        all: data.counts?.all ?? (Array.isArray(data.customers) ? data.customers.length : 0),
        active: data.counts?.active ?? 0,
        inactive: data.counts?.inactive ?? 0,
        restricted: data.counts?.restricted ?? 0,
      })

      setCustomers(
        Array.isArray(data.customers) ? data.customers : []
      )

      setPagination({
        total: data.pagination?.total ?? (Array.isArray(data.customers) ? data.customers.length : 0),
        page: data.pagination?.page ?? page,
        limit: data.pagination?.limit ?? 10,
        totalPages: data.pagination?.totalPages ?? 1,
      })
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError(err.message || 'Unable to load customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [token, page])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Add a new customer
  const handleAddCustomerSubmit = async (e) => {
    e?.preventDefault()

    if (submitting) return

    if (
      !newCustomer.firstName.trim() ||
      !newCustomer.phoneNumber.trim()
    ) {
      setErrorMsg('First name and phone number are required.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMsg('')

      const res = await fetch(`${baseUrl}/company/customers/add`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({
          firstName: newCustomer.firstName.trim(),
          lastName: newCustomer.lastName.trim(),
          phoneNumber: newCustomer.phoneNumber.trim(),
          ...(newCustomer.email.trim()
            ? { email: newCustomer.email.trim() }
            : {}),
        }),
      })

      const json = await res.json()

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || 'Failed to add customer')
      }

      setNewCustomer({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
      })

      setShowModal(false)

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

  // Close modal and clear errors
  const closeModal = () => {
    if (submitting) return
    setShowModal(false)
    setErrorMsg('')
  }

  // Resolve customer status from available API fields
  const getCustomerStatus = (customer) => {
    if (customer.status) {
      return customer.status
    }

    if (customer.isRestricted === true) {
      return 'restricted'
    }

    if (typeof customer.isActive === 'boolean') {
      return customer.isActive ? 'active' : 'inactive'
    }

    return 'active'
  }

  // Format dates safely
  const formatDate = (value) => {
    if (!value) return '-'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '-'
    }

    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
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
        const name = (customer.name || fullName || '').toLowerCase()
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

  // Stat cards matching Dispatcher Dashboard layout
  const statCards = [
    {
      label: 'Total Customers',
      value: counts.all,
      icon: Users,
      color: 'text-signal-blue',
      bg: 'bg-signal-blue/10',
      valueColor: 'text-signal-blue',
    },
    {
      label: 'Active Riders',
      value: counts.active,
      icon: UserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      valueColor: 'text-emerald-600',
    },
    {
      label: 'Inactive',
      value: counts.inactive,
      icon: UserX,
      color: 'text-text-muted',
      bg: 'bg-slate-500/10',
      valueColor: 'text-text-primary',
    },
    {
      label: 'Restricted',
      value: counts.restricted,
      icon: ShieldAlert,
      color: 'text-signal-red',
      bg: 'bg-red-500/10',
      valueColor: 'text-signal-red',
    },
  ]

  // Filter tabs
  const filterTabs = [
    { key: 'all', label: 'All Customers' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'restricted', label: 'Restricted' },
  ]

  // Table columns definition
  const columns = [
    {
      key: 'customer',
      label: 'Customer',
      render: (r) => {
        const fullName = [r.firstName, r.lastName].filter(Boolean).join(' ')
        const displayName = r.name || fullName || r.customer || 'Unknown Rider'
        const initial = displayName.charAt(0).toUpperCase() || 'C'

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-taxi-500/10 font-bold text-taxi-500 text-xs">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-text-primary truncate text-sm">
                {displayName}
              </p>
              <p className="text-xs text-text-muted truncate">
                {r.customerId || r.id || r._id ? `ID: ${r.customerId || r.id || r._id}` : 'Standard Customer'}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'phone',
      label: 'Phone Number',
      render: (r) => {
        const phone = r.phoneNumber || r.phone
        return phone ? (
          <div className="flex items-center gap-1.5 text-xs text-text-primary font-medium">
            <Phone size={13} className="text-text-muted" />
            <span>{phone}</span>
          </div>
        ) : (
          <span className="text-text-muted text-xs">-</span>
        )
      },
    },
    {
      key: 'email',
      label: 'Email',
      render: (r) =>
        r.email ? (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Mail size={13} className="text-text-muted" />
            <span className="truncate max-w-[160px]">{r.email}</span>
          </div>
        ) : (
          <span className="text-text-muted text-xs">-</span>
        ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const status = getCustomerStatus(r)
        return <StatusBadge status={status} />
      },
    },
    {
      key: 'trips',
      label: 'Total Trips',
      align: 'center',
      render: (r) => {
        const count = r.trips ?? r.totalTrips ?? r.tripCount ?? 0
        return (
          <span className="inline-flex items-center gap-1 font-bold text-xs bg-surface-raised px-2.5 py-1 rounded-md text-text-primary border border-border-subtle">
            <Car size={12} className="text-taxi-500" />
            {count}
          </span>
        )
      },
    },
    {
      key: 'lastTrip',
      label: 'Last Trip',
      render: (r) => {
        const lastTrip = r.lastTrip || r.lastTripAt
        return lastTrip ? (
          <span className="text-xs text-text-secondary">{formatDate(lastTrip)}</span>
        ) : (
          <span className="text-xs text-text-muted">No trips yet</span>
        )
      },
    },
    {
      key: 'createdAt',
      label: 'Registered On',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Calendar size={12} className="text-text-muted" />
          <span>{formatDate(r.createdAt)}</span>
        </div>
      ),
    },
  ]

  return (
    <PageLayout
      title="Customers Directory"
      description="Manage company customer profiles, track ride history, and register new riders."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={fetchCustomers}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            icon={UserPlus}
            onClick={() => {
              setErrorMsg('')
              setShowModal(true)
            }}
          >
            Add Customer
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Company Header Card */}
        {company && (
          <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-taxi-500/10 text-taxi-500">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  {company.name || 'Company Account'}
                </h3>
                <p className="text-xs text-text-muted">
                  Company Code: <span className="font-semibold text-text-secondary">{company.code || '-'}</span>
                </p>
              </div>
            </div>
            <div className="text-xs bg-surface-raised px-3 py-1.5 rounded-lg border border-border-subtle text-text-secondary">
              ID: <span className="font-mono font-medium text-text-primary">{company.id || company._id || '-'}</span>
            </div>
          </div>
        )}

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="bg-surface p-4 rounded-xl border border-border-subtle flex items-center justify-between gap-3 shadow-[0_1px_3px_rgba(46,41,34,0.04)]"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    {item.label}
                  </p>
                  <p className={`mt-1 text-2xl font-black ${item.valueColor}`}>
                    {item.value}
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${item.bg}`}>
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
            className="flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-signal-red"
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

        {/* Customers Table Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          {/* Table Toolbar: Filter Tabs & Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === tab.key
                      ? 'bg-taxi-500 text-white shadow-sm'
                      : 'bg-surface text-text-secondary hover:bg-surface-raised hover:text-text-primary border border-border-subtle'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <SearchIcon
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, email..."
                className="w-full rounded-lg border border-border-subtle bg-surface py-2 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:border-taxi-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-surface/70 backdrop-blur-xs">
                <div className="flex items-center gap-2 rounded-lg bg-surface px-4 py-2 text-xs font-semibold text-text-primary shadow-lg border border-border-subtle">
                  <RefreshCw className="h-4 w-4 animate-spin text-taxi-500" />
                  Loading customers...
                </div>
              </div>
            )}

            <Table
              columns={columns}
              rows={filteredCustomers}
              emptyLabel={
                searchQuery || statusFilter !== 'all'
                  ? 'No customers match your search criteria'
                  : 'No customers registered yet'
              }
            />
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle">
              <p className="text-xs text-text-muted">
                Showing{' '}
                <span className="font-semibold text-text-secondary">
                  {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-semibold text-text-secondary">{pagination.total}</span> customers
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="xs"
                  disabled={loading || page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>

                <span className="text-xs text-text-secondary px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="secondary"
                  size="xs"
                  disabled={loading || page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title="Register New Customer"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeModal}
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
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-signal-red flex items-center gap-2"
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
