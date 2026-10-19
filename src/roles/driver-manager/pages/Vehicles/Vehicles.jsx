import { useState, useEffect, useCallback } from 'react'
import { Car, Search as SearchIcon, RefreshCw, AlertTriangle, ShieldCheck, Plus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import StatusBadge from '@/shared/components/StatusBadge'
import Loading from '@/shared/components/Loading'
import AssignVehicleTypeModal from '../../components/AssignVehicleTypeModal'
import { listCompanyDrivers, listVehicleTypes } from '../../services/driverManagerApi'

export default function Vehicles() {
  const [drivers, setDrivers] = useState([])
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const [selectedDriver, setSelectedDriver] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [driversRes, typesRes] = await Promise.all([
        listCompanyDrivers({
          page: 1,
          limit: 100,
          search: search.trim() || undefined,
          vehicleType: typeFilter !== 'all' ? typeFilter : undefined,
        }),
        listVehicleTypes(),
      ])
      setDrivers(driversRes.drivers || [])
      setVehicleTypes(typesRes || [])
    } catch (err) {
      setError(err.message || 'Could not load vehicle fleet.')
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns = [
    {
      key: 'name',
      label: 'Assigned Driver',
      render: (r) => (
        <div>
          <p className="font-bold text-text-primary text-sm">{r.name}</p>
          <p className="text-[11px] text-text-muted">{r.phone || r.email || r.id}</p>
        </div>
      ),
    },
    {
      key: 'vehicleType',
      label: 'Vehicle Class',
      render: (r) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-taxi-500/10 text-taxi-600 px-2.5 py-1 text-xs font-bold">
          <Car size={13} />
          {r.vehicleType || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'plate',
      label: 'Plate & Registration',
      render: (r) => (
        <span className="font-mono font-semibold text-text-primary text-xs">
          {r.plate || 'Pending Registration'}
        </span>
      ),
    },
    {
      key: 'model',
      label: 'Make & Model',
      render: (r) => (
        <span className="text-xs text-text-secondary">
          {r.modelAndYear || r.make || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Driver Status',
      render: (r) => <StatusBadge status={r.statusSlug} />,
    },
    {
      key: 'actions',
      label: 'Action',
      render: (r) => (
        <Button
          size="xs"
          variant="secondary"
          icon={Car}
          onClick={() => setSelectedDriver(r)}
        >
          Assign Class
        </Button>
      ),
    },
  ]

  return (
    <PageLayout
      title="Vehicles & Vehicle Type Assignment"
      description="Inspect fleet vehicles and assign or update vehicle type classes for drivers (PATCH /driver/vehicle-type)."
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={fetchData} disabled={loading}>
            Refresh
          </Button>
        </div>
      }
    >
      {/* Vehicle Types Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {vehicleTypes.map((vt) => {
          const count = drivers.filter(
            (d) =>
              (d.vehicleType || '').toLowerCase() === vt.name.toLowerCase() ||
              d.vehicleTypeId === vt.id
          ).length

          return (
            <div
              key={vt.id}
              onClick={() => setTypeFilter(typeFilter === vt.name ? 'all' : vt.name)}
              className={`glass-card rounded-xl p-3 border transition-all cursor-pointer ${
                typeFilter === vt.name
                  ? 'border-taxi-500 bg-taxi-500/5 shadow-xs'
                  : 'border-border-subtle hover:border-taxi-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Car size={16} className="text-taxi-500" />
                <span className="text-xs font-black text-text-primary">{count}</span>
              </div>
              <p className="text-xs font-bold text-text-primary truncate">{vt.name}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{vt.seats} seats</p>
            </div>
          )
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap md:flex-nowrap items-end gap-3 glass-card p-4 rounded-2xl mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by driver, plate, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={SearchIcon}
          />
        </div>

        <div className="w-full md:w-52">
          <Select
            label="Filter by Vehicle Class"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Classes' },
              ...vehicleTypes.map((t) => ({ value: t.name, label: t.name })),
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8">
            <Loading label="Loading fleet vehicles and assignments..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertTriangle size={32} className="mx-auto text-signal-red mb-2" />
            <p className="text-sm font-semibold text-text-primary mb-1">{error}</p>
            <Button size="sm" variant="secondary" onClick={fetchData} className="mt-3">
              Retry
            </Button>
          </div>
        ) : (
          <Table
            borderless
            columns={columns}
            rows={drivers}
            keyField="id"
            emptyLabel="No vehicles or drivers found"
          />
        )}
      </div>

      {/* Assign Vehicle Type Modal */}
      <AssignVehicleTypeModal
        open={Boolean(selectedDriver)}
        driver={selectedDriver}
        onClose={() => setSelectedDriver(null)}
        onSuccess={() => {
          fetchData()
        }}
      />
    </PageLayout>
  )
}
