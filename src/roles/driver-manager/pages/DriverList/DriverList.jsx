import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search as SearchIcon,
  Eye,
  ShieldAlert,
  CheckCircle,
  Award,
  FileCheck,
  RefreshCw,
  Car,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import StatusBadge from '@/shared/components/StatusBadge'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Table from '@/shared/components/Table'
import Pagination from '@/shared/components/Pagination'
import Loading from '@/shared/components/Loading'
import RejectDriverModal from '../../components/RejectDriverModal'
import AssignVehicleTypeModal from '../../components/AssignVehicleTypeModal'
import {
  listCompanyDrivers,
  updateDriverStatus,
  listVehicleTypes,
  DRIVER_STATUS_OPTIONS,
  DRIVER_STATUS_ENUM
} from '../../services/driverManagerApi'

export default function DriverList() {
  const navigate = useNavigate()

  // State
  const [drivers, setDrivers] = useState([])
  const [totalDrivers, setTotalDrivers] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all')
  const [vehicleTypesList, setVehicleTypesList] = useState([])

  // Modals state
  const [selectedDriverForVehicle, setSelectedDriverForVehicle] = useState(null)
  const [selectedDriverForReject, setSelectedDriverForReject] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  // Load vehicle types for filter
  useEffect(() => {
    async function loadTypes() {
      try {
        const types = await listVehicleTypes()
        setVehicleTypesList(types)
      } catch (err) {
        // Fallback silently if vehicle types fail to load
      }
    }
    loadTypes()
  }, [])

  // Fetch Drivers
  const fetchDrivers = useCallback(async () => {
    setLoading(true)
    setError(null)
    setActionError(null)
    try {
      const res = await listCompanyDrivers({
        page,
        limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter,
        vehicleType: vehicleTypeFilter !== 'all' ? vehicleTypeFilter : undefined,
      })
      setDrivers(res.drivers || [])
      setTotalDrivers(res.total || 0)
      setTotalPages(res.totalPages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load company drivers.')
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchQuery, statusFilter, vehicleTypeFilter])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  // Handle Quick Status Toggle (Approve / Activate / Suspend)
  const handleToggleStatus = async (driver) => {
    setActionLoadingId(driver.id)
    setActionError(null)
    setActionSuccess(null)
    try {
      const nextStatus =
        driver.status === DRIVER_STATUS_ENUM.ACTIVE
          ? DRIVER_STATUS_ENUM.INACTIVE
          : DRIVER_STATUS_ENUM.ACTIVE

      await updateDriverStatus({
        driverId: driver.id,
        status: nextStatus,
      })

      setActionSuccess(`Driver ${driver.name} is now ${nextStatus === 'ACTIVE' ? 'Active' : 'Suspended'}.`)
      fetchDrivers()
    } catch (err) {
      setActionError(err.message || 'Failed to update driver status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  // Handle Reject Driver with Reason
  const handleConfirmReject = async (reason) => {
    if (!selectedDriverForReject) return
    setActionError(null)
    setActionSuccess(null)
    try {
      await updateDriverStatus({
        driverId: selectedDriverForReject.id,
        status: DRIVER_STATUS_ENUM.REJECTED,
        rejectionReason: reason,
      })
      setActionSuccess(`Driver ${selectedDriverForReject.name} was rejected.`)
      fetchDrivers()
    } catch (err) {
      throw err
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (r) => (
        <span className="font-semibold text-text-primary font-mono text-xs">
          {r.id.length > 8 ? `${r.id.slice(0, 8)}...` : r.id}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Driver',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          {r.avatar ? (
            <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-taxi-500/10 text-taxi-500 flex items-center justify-center font-bold text-xs shrink-0">
              {r.name?.charAt(0) || 'D'}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-text-primary truncate">{r.name}</p>
            <p className="text-[11px] text-text-muted truncate">{r.phone || r.email || 'No contact'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'vehicleType',
      label: 'Vehicle Class',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-taxi-500/10 text-taxi-600 px-2 py-0.5 text-xs font-semibold">
            <Car size={12} />
            {r.vehicleType || 'Unassigned'}
          </span>
          <button
            onClick={() => setSelectedDriverForVehicle(r)}
            title="Assign / Change Vehicle Type (PATCH /driver/vehicle-type)"
            className="p-1 text-text-muted hover:text-taxi-500 rounded transition-colors"
          >
            <Plus size={13} />
          </button>
        </div>
      ),
    },
    {
      key: 'vehicle',
      label: 'Plate / Model',
      render: (r) => (
        <div>
          <span className="font-semibold text-text-primary text-xs block">{r.plate || '-'}</span>
          <span className="text-[11px] text-text-muted">{r.modelAndYear || r.make || '-'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.statusSlug || 'inactive'} />,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => (
        <span className="flex items-center gap-1 font-semibold text-text-primary text-xs">
          <Award size={13} className="text-amber-500" /> {r.rating || '5.0'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => {
        const isActive = r.status === DRIVER_STATUS_ENUM.ACTIVE
        const isBusy = actionLoadingId === r.id

        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(`/driver-manager/driver-list/${r.id}`)}
              title="View Driver Dossier & Details"
              className="p-1.5 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded-lg transition-colors"
            >
              <Eye size={15} />
            </button>
            <button
              onClick={() => setSelectedDriverForVehicle(r)}
              title="Assign Vehicle Type (PATCH /driver/vehicle-type)"
              className="p-1.5 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded-lg transition-colors"
            >
              <Car size={15} />
            </button>
            <button
              onClick={() => handleToggleStatus(r)}
              disabled={isBusy}
              title={isActive ? 'Suspend / Deactivate Driver' : 'Activate Driver'}
              className={`p-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-red-500 hover:text-red-700 hover:bg-red-500/10'
                  : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-500/10'
              }`}
            >
              {isActive ? <ShieldAlert size={15} /> : <CheckCircle size={15} />}
            </button>
            <button
              onClick={() => setSelectedDriverForReject(r)}
              title="Reject Driver with Reason"
              className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <XCircle size={15} />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <PageLayout
      title="Driver Management"
      description="Manage registered drivers, update statuses (Approve, Reject, Suspend), and assign vehicle types."
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={fetchDrivers} disabled={loading}>
            Refresh
          </Button>
          <Button variant="secondary" icon={FileCheck} onClick={() => navigate('/driver-manager/driver-list/applications')}>
            Applications Queue
          </Button>
          <Button icon={Plus} onClick={() => navigate('/driver-manager/driver-list/create')}>
            Add Driver
          </Button>
        </div>
      }
    >
      {/* Action alerts */}
      {actionError && (
        <div className="flex items-start gap-2 rounded-xl border border-signal-red/20 bg-signal-red/5 p-3.5 mb-4 text-xs text-signal-red">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 mb-4 text-xs text-emerald-600">
          <CheckCircle size={15} className="mt-0.5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filtering Header Card */}
      <div className="flex flex-wrap md:flex-nowrap md:items-end gap-3 glass-card p-4 rounded-2xl mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name, email, phone, license, plate..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            icon={SearchIcon}
            containerClassName="w-full"
          />
        </div>

        <div className="w-full md:w-44">
          <Select
            label="Driver Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            options={DRIVER_STATUS_OPTIONS}
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            label="Vehicle Class"
            value={vehicleTypeFilter}
            onChange={(e) => {
              setVehicleTypeFilter(e.target.value)
              setPage(1)
            }}
            options={[
              { value: 'all', label: 'All Vehicle Classes' },
              ...vehicleTypesList.map((t) => ({ value: t.name, label: t.name })),
            ]}
          />
        </div>
      </div>

      {/* Driver List Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8">
            <Loading label="Loading company drivers..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle size={32} className="mx-auto text-signal-red mb-2" />
            <p className="text-sm font-semibold text-text-primary mb-1">{error}</p>
            <Button size="sm" variant="secondary" onClick={fetchDrivers} className="mt-3">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <Table
              borderless
              columns={columns}
              rows={drivers}
              keyField="id"
              emptyLabel={
                searchQuery || statusFilter !== 'All' || vehicleTypeFilter !== 'all'
                  ? 'No drivers matching current filters'
                  : 'No registered company drivers found'
              }
            />
            <div className="p-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-text-muted">
                Showing {drivers.length} of {totalDrivers} drivers
              </span>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Assign Vehicle Type Modal */}
      <AssignVehicleTypeModal
        open={Boolean(selectedDriverForVehicle)}
        driver={selectedDriverForVehicle}
        onClose={() => setSelectedDriverForVehicle(null)}
        onSuccess={() => {
          fetchDrivers()
        }}
      />

      {/* Reject Driver Modal */}
      <RejectDriverModal
        open={Boolean(selectedDriverForReject)}
        driver={selectedDriverForReject}
        onClose={() => setSelectedDriverForReject(null)}
        onConfirm={handleConfirmReject}
      />
    </PageLayout>
  )
}
