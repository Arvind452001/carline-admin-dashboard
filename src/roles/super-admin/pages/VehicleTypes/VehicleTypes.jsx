import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Car, CheckCircle, Pencil, Plus, RefreshCw, ShieldOff, Trash2 } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import Search from '@/shared/components/Search'
import Filter from '@/shared/components/Filter'
import Button from '@/shared/components/Button'
import Badge from '@/shared/components/Badge'
import StatusBadge from '@/shared/components/StatusBadge'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import Modal from '@/shared/components/Modal'
import Pagination from '@/shared/components/Pagination'
import ImageLightbox from '@/shared/components/ImageLightbox'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { formatDate } from '@/shared/utils/date'
import { getCurrencySymbol } from '@/shared/utils/currency'
import {
  VEHICLE_TYPE_STATUS,
  VEHICLE_TYPE_STATUS_FILTERS,
  deleteVehicleType,
  getVehicleType,
  listActiveVehicleTypes,
  listVehicleTypes,
  updateVehicleTypeStatus,
} from '@/roles/super-admin/services/vehicleTypeApi'
import VehicleTypeFormModal from './components/VehicleTypeFormModal'

const PAGE_SIZE = 10

const EMPTY_RESULT = { vehicleTypes: [], total: 0, totalPages: 1 }

// Rates carry decimals, so this keeps the backend-driven symbol shared across
// the panel but not the shared zero-decimal rounding.
const AMOUNT_FORMAT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })
const money = (value) =>
  value === null || value === undefined ? '-' : `${getCurrencySymbol()}${AMOUNT_FORMAT.format(value)}`

// Uploaded images are stored but not always served, so a dead one falls back to
// a car icon instead of a broken image.
function VehicleThumb({ row, onPreview }) {
  const [broken, setBroken] = useState(false)
  const previewable = Boolean(row.image) && !broken

  if (!previewable) {
    return (
      <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface-hover">
        <Car size={16} className="text-text-muted" />
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onPreview({ src: row.image, title: row.name })}
      title="View larger"
      className="h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-surface-hover"
    >
      <img src={row.image} alt={row.name} onError={() => setBroken(true)} className="h-full w-full object-cover" />
    </button>
  )
}

export default function VehicleTypes() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)

  const [result, setResult] = useState(EMPTY_RESULT)
  // GET /vehicle-types/active is the unpaginated active set, so it also answers
  // "how many are live" for the status tabs without a second paginated call.
  const [activeCount, setActiveCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [openingId, setOpeningId] = useState('')
  const [actionError, setActionError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [preview, setPreview] = useState(null)

  const debouncedQuery = useDebounce(query, 300)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // The tab counts describe the whole catalogue, so the active slice is
      // fetched on every reload alongside the filtered page. A failure there
      // only drops the counts; the list itself still has to render.
      const [pageResult, active] = await Promise.all([
        listVehicleTypes({ page, limit: PAGE_SIZE, search: debouncedQuery, status }),
        listActiveVehicleTypes().catch(() => null),
      ])
      setResult(pageResult)
      setActiveCount(active ? active.length : null)
    } catch (err) {
      setResult(EMPTY_RESULT)
      setError(err.message || 'Could not load vehicle types.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedQuery, status])

  useEffect(() => {
    load()
  }, [load])

  // Any filter change restarts from the first page, so nothing reacts to a stale
  // page number.
  function changeQuery(value) {
    setQuery(value)
    setPage(1)
  }

  function changeStatus(value) {
    setStatus(value)
    setPage(1)
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  // GET /vehicle-types/{id} is the source of truth for one row, so Edit reloads
  // it first: the form can never save over a row that changed or was removed
  // since the list was fetched.
  async function openEdit(row) {
    setOpeningId(row.id)
    setActionError(null)
    try {
      setEditing(await getVehicleType(row.id))
      setFormOpen(true)
    } catch (err) {
      setActionError(err.message || `Could not open ${row.name}.`)
    } finally {
      setOpeningId('')
    }
  }

  async function handleSaved(message) {
    setFormOpen(false)
    setEditing(null)
    setNotice(message)
    await load()
  }

  const toggleStatus = useCallback(
    async (row) => {
      const next = row.status === VEHICLE_TYPE_STATUS.ACTIVE ? VEHICLE_TYPE_STATUS.INACTIVE : VEHICLE_TYPE_STATUS.ACTIVE
      setBusyId(row.id)
      setActionError(null)
      try {
        await updateVehicleTypeStatus(row.id, next)
        setNotice(`${row.name} is now ${next.toLowerCase()}.`)
        await load()
      } catch (err) {
        setActionError(err.message || `Could not update ${row.name}.`)
      } finally {
        setBusyId('')
      }
    },
    [load]
  )

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setActionError(null)
    try {
      await deleteVehicleType(pendingDelete.id)
      setNotice(`${pendingDelete.name} deleted.`)
      setPendingDelete(null)
      await load()
    } catch (err) {
      setActionError(err.message || `Could not delete ${pendingDelete.name}.`)
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const description = loading
    ? 'Vehicle classes offered across the platform.'
    : `${result.total} vehicle ${result.total === 1 ? 'type' : 'types'} configured.`

  // Counts mirror the description: total is the catalogue size, active comes
  // from the dedicated endpoint, and inactive is whatever is left.
  const statusOptions = VEHICLE_TYPE_STATUS_FILTERS.map((option) => {
    const count =
      option.value === 'All'
        ? result.total
        : option.value === VEHICLE_TYPE_STATUS.ACTIVE
          ? activeCount
          : activeCount === null
            ? null
            : Math.max(0, result.total - activeCount)
    return { value: option.value, label: count === null ? option.label : `${option.label} (${count})` }
  })

  const actions = (
    <>
      <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>
        Refresh
      </Button>
      <Button icon={Plus} onClick={openCreate}>
        Add Vehicle Type
      </Button>
    </>
  )

  return (
    <PageLayout title="Vehicle Types" description={description} actions={actions}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Search value={query} onChange={changeQuery} placeholder="Search vehicle types..." />
        <Filter options={statusOptions} value={status} onChange={changeStatus} />
      </div>

      {notice && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-text-secondary">
          <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {actionError && (
        <div className="flex items-start gap-2 rounded-xl border border-signal-red/20 bg-signal-red/5 px-4 py-3 text-xs text-text-secondary">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-signal-red" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <Loading label="Loading vehicle types..." />
      ) : error ? (
        <ErrorState title="Could not load vehicle types" description={error} onRetry={load} />
      ) : (
        <>
          <Table
            columns={[
              {
                key: 'vehicle',
                label: 'Vehicle',
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <VehicleThumb row={row} onPreview={setPreview} />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-medium text-text-primary">
                        {row.name}
                        {row.badge && <Badge tone="taxi">{row.badge}</Badge>}
                      </p>
                      {row.description && <p className="max-w-xs truncate text-xs text-text-muted">{row.description}</p>}
                    </div>
                  </div>
                ),
              },
              { key: 'seats', label: 'Seats', render: (row) => row.seats },
              { key: 'etaText', label: 'ETA', render: (row) => row.etaText || '-' },
              {
                key: 'rates',
                label: 'Rates',
                render: (row) => (
                  <div>
                    <p className="text-text-primary">Base {money(row.basePrice)}</p>
                    <p className="text-xs text-text-muted">
                      {money(row.perKmRate)}/km - {money(row.perMinuteRate)}/min
                    </p>
                  </div>
                ),
              },
              { key: 'sortOrder', label: 'Order', render: (row) => (row.sortOrder === null ? '-' : row.sortOrder) },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.statusSlug} /> },
              {
                key: 'updatedAt',
                label: 'Updated',
                render: (row) => (row.updatedAt ? formatDate(row.updatedAt) : '-'),
              },
              {
                key: 'action',
                label: 'Action',
                render: (row) => {
                  const isActive = row.status === VEHICLE_TYPE_STATUS.ACTIVE
                  const busy = busyId === row.id
                  const opening = openingId === row.id
                  return (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Pencil}
                        onClick={() => openEdit(row)}
                        disabled={busy || opening}
                      >
                        {opening ? 'Opening...' : 'Edit'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={isActive ? ShieldOff : CheckCircle}
                        onClick={() => toggleStatus(row)}
                        disabled={busy}
                      >
                        {busy ? 'Saving...' : isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="danger" icon={Trash2} onClick={() => setPendingDelete(row)}>
                        Delete
                      </Button>
                    </div>
                  )
                },
              },
            ]}
            rows={result.vehicleTypes}
            emptyLabel="No vehicle types found"
          />
          <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
        </>
      )}

      <VehicleTypeFormModal
        open={formOpen}
        vehicleType={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSaved={handleSaved}
      />

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (deleting ? null : setPendingDelete(null))}
        title="Delete vehicle type"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Delete <span className="font-semibold text-text-primary">{pendingDelete?.name}</span>? This cannot be undone.
        </p>
      </Modal>

      <ImageLightbox
        open={Boolean(preview)}
        src={preview?.src}
        title={preview?.title}
        onClose={() => setPreview(null)}
      />
    </PageLayout>
  )
}
