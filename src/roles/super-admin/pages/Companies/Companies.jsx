import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search as SearchIcon, Eye, Edit2, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import StatusBadge from '@/shared/components/StatusBadge'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Table from '@/shared/components/Table'
import Pagination from '@/shared/components/Pagination'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import { listCompanies, updateCompanyStatus } from '@/roles/super-admin/services/superAdminApi'

const PAGE_SIZE = 8

export default function Companies() {
  const navigate = useNavigate()

  const [companies, setCompanies] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')

  // The API has no cities endpoint, so options accumulate from loaded results.
  const [knownCities, setKnownCities] = useState([])

  const [pendingId, setPendingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listCompanies({
        search: debouncedSearch || undefined,
        status: statusFilter,
        city: cityFilter === 'all' ? undefined : cityFilter,
        page,
        limit: PAGE_SIZE,
      })
      setCompanies(result.items)
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setKnownCities((prev) =>
        [...new Set([...prev, ...result.items.map((c) => c.city)])]
          .filter((city) => city && city !== '—')
          .sort((a, b) => a.localeCompare(b))
      )
    } catch (err) {
      setError(err)
      setCompanies([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter, cityFilter, page])

  useEffect(() => {
    load()
  }, [load])

  const toggleStatus = async (company) => {
    const next = company.status === 'active' ? 'suspended' : 'active'
    setPendingId(company.mongoId)
    setActionError(null)
    try {
      await updateCompanyStatus(company.mongoId, next)
      setCompanies((prev) => prev.map((c) => (c.mongoId === company.mongoId ? { ...c, status: next } : c)))
    } catch (err) {
      setActionError(err.message || 'Could not update the company status.')
    } finally {
      setPendingId(null)
    }
  }

  const columns = [
    { key: 'companyId', label: 'Company ID', render: (r) => <span className="font-semibold text-text-primary">{r.companyId}</span> },
    { key: 'legalName', label: 'Legal Name' },
    { key: 'displayName', label: 'Display Name' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'contact', label: 'Primary Contact' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'created', label: 'Created Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/super-admin/companies/${r.mongoId}`)}
            title="View Details"
            className="p-1 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/super-admin/companies/${r.mongoId}/edit`)}
            title="Edit Company"
            className="p-1 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => toggleStatus(r)}
            disabled={pendingId === r.mongoId}
            title={r.status === 'active' ? 'Suspend Company' : 'Activate Company'}
            className={`p-1 rounded transition-colors disabled:opacity-40 ${
              r.status === 'active'
                ? 'text-red-500 hover:text-red-700 hover:bg-red-500/10'
                : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-500/10'
            }`}
          >
            {r.status === 'active' ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
          </button>
        </div>
      ),
    },
  ]

  return (
    <PageLayout
      title="Companies"
      description="Manage all taxi companies operating on the platform"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button icon={Plus} onClick={() => navigate('/super-admin/companies/create')}>
            Add Company
          </Button>
        </div>
      }
    >
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-end gap-3 glass-card p-4 rounded-2xl mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search by ID, name, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={SearchIcon}
            containerClassName="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            label="City"
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value)
              setPage(1)
            }}
            options={['all', ...knownCities].map((city) => ({
              value: city,
              label: city === 'all' ? 'All Cities' : city,
            }))}
          />
        </div>
      </div>

      {actionError && (
        <div className="mb-4 rounded-xl border border-signal-red/30 bg-signal-red/10 px-3.5 py-2 text-xs text-signal-red">
          {actionError}
        </div>
      )}

      {/* Table & Pagination */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <Loading label="Loading companies..." />
        ) : error ? (
          <div className="p-4">
            <ErrorState
              title="Could not load companies"
              description={error.message}
              onRetry={load}
            />
          </div>
        ) : (
          <>
            <Table borderless columns={columns} rows={companies} keyField="id" emptyLabel="No companies found" />
            <div className="p-4 border-t border-border-subtle">
              <p className="mb-2 text-xs text-text-muted">
                {total} {total === 1 ? 'company' : 'companies'}
              </p>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </PageLayout>
  )
}