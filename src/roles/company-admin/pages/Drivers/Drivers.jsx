import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BadgeCheck, Eye, RefreshCw, ShieldCheck, ShieldOff, Star, XCircle } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import Search from '@/shared/components/Search'
import Filter from '@/shared/components/Filter'
import Select from '@/shared/components/Select'
import Button from '@/shared/components/Button'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import StatusBadge from '@/shared/components/StatusBadge'
import Pagination from '@/shared/components/Pagination'
import RejectDriverModal from '@/roles/driver-manager/components/RejectDriverModal'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { formatDate } from '@/shared/utils/date'
import { initials } from '@/shared/utils/formatting'
import {
  DRIVER_ACTIVE_STATUS,
  DRIVER_INACTIVE_STATUS,
  DRIVER_REJECTED_STATUS,
  DRIVER_STATUS_OPTIONS,
  driverStatusActionLabel,
  listCompanyDrivers,
  listVehicleTypes,
  updateDriverStatus,
  vehicleTypeOptions,
} from '@/roles/company-admin/services/driverApi'

const PAGE_SIZE = 10

const EMPTY_RESULT = { drivers: [], total: 0, totalPages: 1 }

export default function Drivers() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [vehicleType, setVehicleType] = useState('')
  const [page, setPage] = useState(1)

  const [result, setResult] = useState(EMPTY_RESULT)
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingId, setSavingId] = useState('')
  const [actionError, setActionError] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)

  const debouncedQuery = useDebounce(query, 300)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listCompanyDrivers({
        page,
        limit: PAGE_SIZE,
        search: debouncedQuery,
        status,
        vehicleType,
      })
      setResult(data)
    } catch (err) {
      setResult(EMPTY_RESULT)
      setError(err.message || 'Could not load drivers.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedQuery, status, vehicleType])

  useEffect(() => {
    load()
  }, [load])

  // The vehicle-type filter is fed by the API; if it fails the list still works.
  useEffect(() => {
    let active = true
    listVehicleTypes()
      .then((types) => {
        if (active) setVehicleTypes(types)
      })
      .catch(() => {
        if (active) setVehicleTypes([])
      })
    return () => {
      active = false
    }
  }, [])

  // Any filter change restarts from the first page, so nothing has to react to
  // a stale page number.
  function changeQuery(value) {
    setQuery(value)
    setPage(1)
  }

  function changeStatus(value) {
    setStatus(value)
    setPage(1)
  }

  function changeVehicleType(value) {
    setVehicleType(value)
    setPage(1)
  }

  const toggleStatus = useCallback(
    async (driver) => {
      const next = driver.status === DRIVER_ACTIVE_STATUS ? DRIVER_INACTIVE_STATUS : DRIVER_ACTIVE_STATUS
      setSavingId(driver.id)
      setActionError(null)
      try {
        await updateDriverStatus({ driverId: driver.id, status: next })
        await load()
      } catch (err) {
        setActionError(err.message || `Could not update ${driver.name}.`)
      } finally {
        setSavingId('')
      }
    },
    [load]
  )

  // The rejection reason is the point of this call, so failures are rethrown for
  // the dialog to show beside the field instead of in the page banner.
  const rejectDriver = useCallback(
    async (reason) => {
      if (!rejectTarget) return
      setSavingId(rejectTarget.id)
      try {
        await updateDriverStatus({
          driverId: rejectTarget.id,
          status: DRIVER_REJECTED_STATUS,
          rejectionReason: reason,
        })
        await load()
      } finally {
        setSavingId('')
      }
    },
    [rejectTarget, load]
  )

  const description = loading
    ? 'Drivers registered with your company.'
    : `${result.total} ${result.total === 1 ? 'driver' : 'drivers'} registered with your company.`

  const actions = (
    <>
      <Select
        aria-label="Vehicle type"
        options={vehicleTypeOptions(vehicleTypes)}
        value={vehicleType}
        onChange={(event) => changeVehicleType(event.target.value)}
        className="h-[38px] !py-1.5"
        containerClassName="w-full sm:w-48"
      />
      <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>
        Refresh
      </Button>
    </>
  )

  return (
    <PageLayout title="Drivers" description={description} actions={actions}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Search value={query} onChange={changeQuery} placeholder="Search drivers..." />
        <Filter options={DRIVER_STATUS_OPTIONS} value={status} onChange={changeStatus} />
      </div>

      {actionError && (
        <div className="flex items-start gap-2 rounded-xl border border-signal-red/20 bg-signal-red/5 px-4 py-3 text-xs text-text-secondary">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-signal-red" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <Loading label="Loading drivers..." />
      ) : error ? (
        <ErrorState title="Could not load drivers" description={error} onRetry={load} />
      ) : (
        <>
          <Table
            columns={[
              {
                key: 'name',
                label: 'Driver',
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-taxi-500/12 text-xs font-bold text-taxi-600">
                      {initials(row.name) || '?'}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 font-semibold text-text-primary">
                        {row.name}
                        {row.isVerified && (
                          <BadgeCheck size={14} className="shrink-0 text-signal-green" aria-label="Verified driver" />
                        )}
                      </p>
                      {row.phone && <p className="mt-0.5 text-xs text-text-muted">{row.phone}</p>}
                    </div>
                  </div>
                ),
              },
              { key: 'email', label: 'Email', render: (row) => row.email || '-' },
              {
                key: 'license',
                label: 'License',
                render: (row) => (
                  <div>
                    <p className="font-medium text-text-primary">{row.licenseNumber || '-'}</p>
                    {row.licenseClass && <p className="mt-0.5 text-xs text-text-muted">{row.licenseClass}</p>}
                  </div>
                ),
              },
              { key: 'employmentType', label: 'Employment', render: (row) => row.employmentType || '-' },
              { key: 'serviceArea', label: 'Service area', render: (row) => row.serviceArea || '-' },
              {
                key: 'vehicleType',
                label: 'Vehicle',
                render: (row) => (
                  <div>
                    <p className="font-medium text-text-primary">{row.vehicleType || '-'}</p>
                    {(row.make || row.modelAndYear) && (
                      <p className="mt-0.5 text-xs text-text-muted">
                        {[row.make, row.modelAndYear].filter(Boolean).join(' ')}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                key: 'plate',
                label: 'Plate',
                render: (row) =>
                  row.plate ? (
                    <span className="rounded-md border border-border-strong bg-surface-raised px-2 py-0.5 font-mono text-xs font-semibold tracking-tight text-text-primary">
                      {row.plate}
                    </span>
                  ) : (
                    '-'
                  ),
              },
              {
                key: 'fuelType',
                label: 'Fuel',
                render: (row) => (
                  <div>
                    <p className="font-medium text-text-primary">{row.fuelType || '-'}</p>
                    {row.transmission && <p className="mt-0.5 text-xs text-text-muted">{row.transmission}</p>}
                  </div>
                ),
              },
              {
                key: 'isOnline',
                label: 'Online',
                render: (row) => <StatusBadge status={row.isOnline ? 'online' : 'offline'} />,
              },
              {
                key: 'rating',
                label: 'Rating',
                align: 'right',
                render: (row) =>
                  row.rating === null || row.rating === '' ? (
                    <span className="text-text-muted">-</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
                      <Star size={13} className="fill-signal-amber text-signal-amber" />
                      {row.rating}
                    </span>
                  ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => (
                  <div>
                    <StatusBadge status={row.statusSlug} />
                    {row.status === DRIVER_REJECTED_STATUS && row.rejectionReason && (
                      <p className="mt-1 max-w-[12rem] truncate text-xs text-text-muted" title={row.rejectionReason}>
                        {row.rejectionReason}
                      </p>
                    )}
                  </div>
                ),
              },
              {
                key: 'createdAt',
                label: 'Joined',
                render: (row) => (row.createdAt ? formatDate(row.createdAt) : '-'),
              },
              {
                key: 'action',
                label: 'Action',
                sticky: 'right',
                render: (row) => {
                  const isActive = row.status === DRIVER_ACTIVE_STATUS
                  const busy = savingId === row.id
                  return (
                    <div className="flex items-center gap-2">
                      <Link to={`/company-admin/drivers/${row.id}`}>
                        <Button size="sm" variant="secondary" icon={Eye}>
                          View
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant={isActive ? 'secondary' : 'success'}
                        icon={isActive ? ShieldOff : ShieldCheck}
                        onClick={() => toggleStatus(row)}
                        disabled={busy}
                      >
                        {busy ? 'Saving...' : driverStatusActionLabel(row.status)}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={XCircle}
                        onClick={() => setRejectTarget(row)}
                        disabled={busy}
                      >
                        Reject
                      </Button>
                    </div>
                  )
                },
              },
            ]}
            rows={result.drivers}
            emptyLabel="No drivers found"
          />
          <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
        </>
      )}

      <RejectDriverModal
        open={Boolean(rejectTarget)}
        driver={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={rejectDriver}
      />
    </PageLayout>
  )
}
