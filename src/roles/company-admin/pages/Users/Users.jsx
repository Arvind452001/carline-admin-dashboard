import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, RefreshCw, Power, Loader2 } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import Search from '@/shared/components/Search'
import Filter from '@/shared/components/Filter'
import Select from '@/shared/components/Select'
import Pagination from '@/shared/components/Pagination'
import Badge from '@/shared/components/Badge'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { ROLE_LABELS, ROLES } from '@/access/roles'
import {
  listCompanyUsers,
  updateCompanyUserStatus,
  deleteCompanyUser,
  resendCompanyUserCredentials,
} from '@/roles/company-admin/services/companyUsersApi'

const PAGE_SIZE = 8

// The company owner may assign any of their own team's roles, but never
// Super Admin or Company Admin.
const companyRoleKeys = [
  ROLES.DISPATCHER,
  ROLES.DRIVER_MANAGER,
  ROLES.CUSTOMER_SERVICE,
  ROLES.BILLING,
  ROLES.ACCOUNTING,
  ROLES.MANAGER,
  ROLES.READ_ONLY,
  ROLES.REPORT_ONLY,
]

const roleFilterOptions = [
  { value: 'all', label: 'All Roles' },
  ...companyRoleKeys.map((key) => ({ value: key, label: ROLE_LABELS[key] })),
]

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function Users() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const debouncedQuery = useDebounce(query, 300)

  // One request at a time; `pendingId` marks the row whose action is running.
  const [pendingId, setPendingId] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [notice, setNotice] = useState('')
  const [confirmUser, setConfirmUser] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listCompanyUsers({
        page,
        limit: PAGE_SIZE,
        search: debouncedQuery.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
      })
      setUsers(result.items)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err.message || 'Could not load your team members.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedQuery, roleFilter, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  // Filters reset to the first page in the same update as the filter change, so
  // the request is never fired twice for one interaction.
  const changeQuery = (value) => {
    setQuery(value)
    setPage(1)
  }

  const changeRoleFilter = (value) => {
    setRoleFilter(value)
    setPage(1)
  }

  const changeStatusFilter = (value) => {
    setStatusFilter(value)
    setPage(1)
  }

  function clearMessages() {
    setActionError(null)
    setNotice('')
  }

  async function handleToggleStatus(user) {
    const next = user.status === 'active' ? 'inactive' : 'active'
    clearMessages()
    setPendingId(user.id)
    try {
      await updateCompanyUserStatus(user.id, next)
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)))
      setNotice(`${user.name} is now ${next}.`)
    } catch (err) {
      setActionError(err.message || 'Could not update the status.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleResend(user) {
    clearMessages()
    setPendingId(user.id)
    try {
      await resendCompanyUserCredentials(user.id)
      setNotice(`New login credentials were sent to ${user.email}.`)
    } catch (err) {
      setActionError(err.message || 'Could not resend the credentials.')
    } finally {
      setPendingId(null)
    }
  }

  async function handleDelete() {
    const target = confirmUser
    if (!target) return
    clearMessages()
    setPendingId(target.id)
    try {
      await deleteCompanyUser(target.id)
      setConfirmUser(null)
      setNotice(`${target.name} was removed from your team.`)
      // Removing the last row of the last page would otherwise strand the view.
      if (users.length === 1 && page > 1) setPage(page - 1)
      else load()
    } catch (err) {
      setActionError(err.message || 'Could not remove this team member.')
      setConfirmUser(null)
    } finally {
      setPendingId(null)
    }
  }

  const isFiltered = Boolean(debouncedQuery.trim()) || roleFilter !== 'all' || statusFilter !== 'all'

  return (
    <PageLayout
      title="Users"
      description={
        total > 0
          ? `${total} team member${total === 1 ? '' : 's'} in your company.`
          : "Everyone with access to your company's admin panel."
      }
      actions={
        <Button as={Link} to="/company-admin/users/new" icon={Plus}>
          Add User
        </Button>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <Search value={query} onChange={changeQuery} placeholder="Search name or email" />
          <Select
            options={roleFilterOptions}
            value={roleFilter}
            onChange={(e) => changeRoleFilter(e.target.value)}
            className="h-[38px] !py-1.5"
            containerClassName="w-full sm:w-48"
          />
        </div>
        <Filter options={STATUS_FILTERS} value={statusFilter} onChange={changeStatusFilter} />
      </div>

      {notice && (
        <div className="rounded-xl border border-signal-green/25 bg-signal-green/10 px-3.5 py-2 text-xs text-signal-green">
          {notice}
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-signal-red/30 bg-signal-red/10 px-3.5 py-2 text-xs text-signal-red">
          {actionError}
        </div>
      )}

      {loading ? (
        <Loading label="Loading team members..." />
      ) : error ? (
        <ErrorState title="Could not load users" description={error} onRetry={load} />
      ) : (
        <>
          <Table
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              {
                key: 'role',
                label: 'Role',
                render: (r) => <Badge tone="taxi">{ROLE_LABELS[r.role] || r.roleCode || 'Unassigned'}</Badge>,
              },
              {
                key: 'status',
                label: 'Status',
                render: (r) => (
                  <Badge tone={r.status === 'active' ? 'green' : 'red'} dot>
                    {r.status}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (r) => {
                  const busy = pendingId === r.id
                  return (
                    <div className="flex items-center gap-1">
                      <Button
                        as={Link}
                        to={`/company-admin/users/${r.id}/edit`}
                        size="sm"
                        variant="ghost"
                        icon={Pencil}
                        title="Edit this user"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={busy ? Loader2 : RefreshCw}
                        onClick={() => handleResend(r)}
                        disabled={busy}
                        title="Email fresh login credentials"
                      >
                        Resend
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Power}
                        onClick={() => handleToggleStatus(r)}
                        disabled={busy}
                        title={r.status === 'active' ? 'Deactivate this account' : 'Activate this account'}
                      >
                        {r.status === 'active' ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => setConfirmUser(r)}
                        disabled={busy}
                        title="Remove this user"
                      >
                        Delete
                      </Button>
                    </div>
                  )
                },
              },
            ]}
            rows={users}
            emptyLabel={isFiltered ? 'No users match these filters' : 'No users yet ? add your first team member'}
          />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <Modal
        open={Boolean(confirmUser)}
        onClose={() => setConfirmUser(null)}
        title="Remove team member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmUser(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={pendingId === confirmUser?.id ? Loader2 : Trash2}
              onClick={handleDelete}
              disabled={pendingId === confirmUser?.id}
            >
              {pendingId === confirmUser?.id ? 'Removing...' : 'Remove user'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Remove <span className="font-semibold text-text-primary">{confirmUser?.name}</span> ({confirmUser?.email})?
        </p>
        <p className="mt-2 text-xs text-text-muted">
          They will lose access to the admin panel immediately. This cannot be undone.
        </p>
      </Modal>
    </PageLayout>
  )
}
