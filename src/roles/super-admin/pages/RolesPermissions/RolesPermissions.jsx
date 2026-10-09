import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search as SearchIcon, Eye, Edit2, ShieldAlert, CheckCircle } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import StatusBadge from '@/shared/components/StatusBadge'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Table from '@/shared/components/Table'
import Pagination from '@/shared/components/Pagination'
import { usePagination } from '@/shared/hooks/usePagination'

const INITIAL_ROLES = [
  { slug: 'super-admin', name: 'Super Administrator', users: 2, scope: 'Platform', status: 'Active', updated: 'Today', description: 'Platform-wide administrator with full system override capability.' },
  { slug: 'company-admin', name: 'Company Administrator', users: 8, scope: 'Company', status: 'Active', updated: 'Today', description: 'Manages settings, users, and resources for a specific taxi company.' },
  { slug: 'dispatcher', name: 'Dispatcher', users: 15, scope: 'Company', status: 'Active', updated: 'Today', description: 'Manages live bookings, dispatch controls, and manual bookings.' },
  { slug: 'billing', name: 'Billing / Finance', users: 4, scope: 'Company', status: 'Active', updated: 'Today', description: 'Manages invoices, company billing details, payments, and payouts.' },
  { slug: 'accounting', name: 'Accountant', users: 3, scope: 'Company', status: 'Active', updated: 'Today', description: 'View financial statements and run audits/reconciliations.' },
  { slug: 'manager', name: 'Manager', users: 5, scope: 'Company', status: 'Active', updated: 'Today', description: 'Monitors overall company operations and reports.' },
  { slug: 'customer-service', name: 'Customer Service', users: 12, scope: 'Company', status: 'Active', updated: 'Today', description: 'Handles rider requests, ticket support, and views trip histories.' },
  { slug: 'driver-manager', name: 'Driver Manager', users: 6, scope: 'Company', status: 'Active', updated: 'Today', description: 'Approves drivers, documents, vehicle logs, and performance metrics.' },
  { slug: 'read-only', name: 'Read Only', users: 4, scope: 'Company', status: 'Active', updated: 'Today', description: 'Read-only access to view logs, trips, and overall status.' },
  { slug: 'report-only', name: 'Report Only', users: 3, scope: 'Company', status: 'Active', updated: 'Today', description: 'Access restricted to compilation and generation of reports.' }
]

export default function RolesPermissions() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState(INITIAL_ROLES)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch = 
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || role.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [roles, searchQuery, statusFilter])

  const { page, setPage, totalPages, pageItems } = usePagination(filteredRoles, 8)

  const toggleStatus = (slug) => {
    setRoles(prev => prev.map(r => {
      if (r.slug === slug) {
        return { ...r, status: r.status === 'Active' ? 'Suspended' : 'Active' }
      }
      return r
    }))
  }

  const columns = [
    { key: 'name', label: 'Role', render: (r) => (
      <div>
        <span className="font-semibold text-text-primary block">{r.name}</span>
        <span className="text-[11px] text-text-muted line-clamp-1">{r.description}</span>
      </div>
    )},
    { key: 'users', label: 'Users', render: (r) => <span className="font-medium text-text-primary">{r.users}</span> },
    { key: 'scope', label: 'Scope', render: (r) => (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        r.scope === 'Platform' ? 'bg-amber-500/10 text-taxi-600 ring-amber-500/20' : 'bg-purple-500/10 text-signal-purple ring-purple-500/20'
      }`}>
        {r.scope}
      </span>
    )},
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status.toLowerCase()} /> },
    { key: 'updated', label: 'Updated' },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/super-admin/roles/${r.slug}`)}
            title="View details & Matrix"
            className="p-1.5 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => navigate(`/super-admin/roles/${r.slug}?edit=true`)}
            title="Edit Permissions"
            className="p-1.5 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
          >
            <Edit2 size={16} />
          </button>
          {r.slug !== 'super-admin' && (
            <button
              onClick={() => toggleStatus(r.slug)}
              title={r.status === 'Active' ? 'Suspend Role' : 'Activate Role'}
              className={`p-1.5 rounded transition-colors ${
                r.status === 'Active' 
                  ? 'text-red-500 hover:text-red-700 hover:bg-red-500/10' 
                  : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-500/10'
              }`}
            >
              {r.status === 'Active' ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
            </button>
          )}
        </div>
      )
    }
  ]

  return (
    <PageLayout
      title="Roles & Permissions"
      description="Manage platform and company access levels, configure permission sets, and view assigned users."
      actions={
        <Button icon={Plus} onClick={() => navigate('/super-admin/roles/create')}>
          Create Role
        </Button>
      }
    >
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-end gap-3 glass-card p-4 rounded-2xl mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search roles..."
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
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' }
            ]}
          />
        </div>
      </div>

      {/* Roles Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <Table borderless columns={columns} rows={pageItems} keyField="slug" emptyLabel="No roles found" />
        <div className="p-4 border-t border-border-subtle">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </PageLayout>
  )
}
