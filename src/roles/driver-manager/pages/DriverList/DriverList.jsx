import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search as SearchIcon, Eye, ShieldAlert, CheckCircle, Award, FileCheck } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import StatusBadge from '@/shared/components/StatusBadge'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Table from '@/shared/components/Table'
import Pagination from '@/shared/components/Pagination'
import { usePagination } from '@/shared/hooks/usePagination'

const INITIAL_DRIVERS = [
  { id: 'DRV-101', name: 'Mike Johnson', company: 'ABC Taxi', vehicle: 'Toyota Camry (ABC-123)', status: 'Active', availability: 'On Duty', documents: 'Valid', rating: '4.9', trips: 124, earnings: '$1,240.00' },
  { id: 'DRV-102', name: 'Sarah Lee', company: 'XYZ Cabs', vehicle: 'Hyundai Sonata (XYZ-998)', status: 'Active', availability: 'Break', documents: 'Expiring Soon', rating: '4.8', trips: 98, earnings: '$880.00' },
  { id: 'DRV-103', name: 'Alex Kumar', company: 'ABC Taxi', vehicle: 'Honda Accord (ACC-441)', status: 'Suspended', availability: 'Unavailable', documents: 'Expired', rating: '4.2', trips: 54, earnings: '$410.00' },
  { id: 'DRV-104', name: 'Rahul Singh', company: 'City Ride', vehicle: 'Nissan Altima (NSS-882)', status: 'Active', availability: 'Available', documents: 'Valid', rating: '4.7', trips: 110, earnings: '$1,020.00' },
  { id: 'DRV-105', name: 'Neha Gupta', company: 'XYZ Cabs', vehicle: 'Ford Fusion (FRD-330)', status: 'Inactive', availability: 'Offline', documents: 'Pending Verification', rating: '4.5', trips: 32, earnings: '$280.00' }
]

export default function DriverList() {
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [availFilter, setAvailFilter] = useState('all')
  const [docFilter, setDocFilter] = useState('all')

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.vehicle.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || d.status.toLowerCase() === statusFilter.toLowerCase()
      const matchesAvail = availFilter === 'all' || d.availability.toLowerCase() === availFilter.toLowerCase()
      const matchesDoc = docFilter === 'all' || d.documents.toLowerCase() === docFilter.toLowerCase()

      return matchesSearch && matchesStatus && matchesAvail && matchesDoc
    })
  }, [drivers, searchQuery, statusFilter, availFilter, docFilter])

  const { page, setPage, totalPages, pageItems } = usePagination(filteredDrivers, 5)

  const toggleStatus = (id) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, status: d.status === 'Active' ? 'Suspended' : 'Active' }
      }
      return d
    }))
  }

  const columns = [
    { key: 'id', label: 'ID', render: (r) => <span className="font-semibold text-text-primary">{r.id}</span> },
    { key: 'name', label: 'Driver', render: (r) => <span className="font-bold text-text-primary">{r.name}</span> },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status.toLowerCase()} /> },
    { key: 'availability', label: 'Availability', render: (r) => (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        r.availability === 'On Duty' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' :
        r.availability === 'Available' ? 'bg-taxi-500/10 text-taxi-500 ring-taxi-500/20' :
        r.availability === 'Break' ? 'bg-amber-500/10 text-amber-600 ring-amber-500/20' :
        'bg-slate-500/10 text-text-muted ring-slate-500/20'
      }`}>
        {r.availability}
      </span>
    )},
    { key: 'documents', label: 'Documents', render: (r) => (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        r.documents === 'Valid' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' :
        r.documents === 'Expiring Soon' ? 'bg-amber-500/10 text-amber-600 ring-amber-500/20' :
        r.documents === 'Expired' ? 'bg-red-500/10 text-signal-red ring-red-500/20' :
        'bg-purple-500/10 text-signal-purple ring-purple-500/20'
      }`}>
        {r.documents}
      </span>
    )},
    { key: 'rating', label: 'Rating', render: (r) => <span className="flex items-center gap-1 font-semibold text-text-primary"><Award size={13} className="text-amber-500" /> {r.rating}</span> },
    { key: 'trips', label: 'Trips' },
    { key: 'earnings', label: 'Earnings', render: (r) => <span className="font-bold text-taxi-500">{r.earnings}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/driver-manager/driver-list/${r.id}`)}
            title="View Profile Details"
            className="p-1 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => toggleStatus(r.id)}
            title={r.status === 'Active' ? 'Suspend Driver' : 'Activate Driver'}
            className={`p-1 rounded transition-colors ${
              r.status === 'Active' 
                ? 'text-red-500 hover:text-red-700 hover:bg-red-500/10' 
                : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-500/10'
            }`}
          >
            {r.status === 'Active' ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
          </button>
        </div>
      )
    }
  ]

  return (
    <PageLayout
      title="Driver Management"
      description="Manage registered drivers, monitor statuses, verify documentation, and coordinate onboarding applications."
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" icon={FileCheck} onClick={() => navigate('/driver-manager/driver-list/applications')}>
            Applications Queue
          </Button>
          <Button icon={Plus} onClick={() => navigate('/driver-manager/driver-list/create')}>
            Add Driver
          </Button>
        </div>
      }
    >
      {/* Filtering Header Card */}
      <div className="flex flex-wrap md:flex-nowrap md:items-end gap-3 glass-card p-4 rounded-2xl mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search drivers by name, ID, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={SearchIcon}
            containerClassName="w-full"
          />
        </div>

        <div className="w-full md:w-32">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' }
            ]}
          />
        </div>
        <div className="w-full md:w-36">
          <Select
            label="Availability"
            value={availFilter}
            onChange={(e) => setAvailFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Availability' },
              { value: 'on duty', label: 'On Duty' },
              { value: 'available', label: 'Available' },
              { value: 'break', label: 'Break' },
              { value: 'offline', label: 'Offline' }
            ]}
          />
        </div>
        <div className="w-full md:w-36">
          <Select
            label="Documents"
            value={docFilter}
            onChange={(e) => setDocFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Documents' },
              { value: 'valid', label: 'Valid' },
              { value: 'expiring soon', label: 'Expiring Soon' },
              { value: 'expired', label: 'Expired' },
              { value: 'pending verification', label: 'Pending' }
            ]}
          />
        </div>
      </div>

      {/* Driver List Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <Table borderless columns={columns} rows={pageItems} keyField="id" emptyLabel="No drivers found" />
        <div className="p-4 border-t border-border-subtle">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </PageLayout>
  )
}
