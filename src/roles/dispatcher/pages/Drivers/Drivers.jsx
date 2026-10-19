import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Car,
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Award,
  RefreshCw,
  Clock,
  Compass,
  FileText,
  UserCheck,
  ChevronRight,
  Radio,
  ExternalLink,
  X,
  Filter as FilterIcon
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Modal from '@/shared/components/Modal'
import Loading from '@/shared/components/Loading'
import { apiClient } from '@/shared/services/apiClient'

export default function Drivers() {
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedDriver, setSelectedDriver] = useState(null)

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await apiClient.get('/driver/company-drivers/all?limit=50')
      const list = res?.drivers || res?.data?.drivers || (Array.isArray(res) ? res : [])
      setDrivers(list)
    } catch (err) {
      console.error('Error fetching drivers:', err)
      setError(err?.message || 'Could not load company drivers list.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  // Filtered drivers list
  const filteredDrivers = drivers.filter((d) => {
    const q = search.toLowerCase()
    const name = (d.fullName || d.name || '').toLowerCase()
    const phone = (d.phoneNumber || d.phone || '').toLowerCase()
    const email = (d.email || '').toLowerCase()
    const plate = (d.vehicleRegistrationNumber || '').toLowerCase()
    const vehicle = (d.vehicleType || d.make || '').toLowerCase()

    const matchesSearch = !q || name.includes(q) || phone.includes(q) || email.includes(q) || plate.includes(q) || vehicle.includes(q)
    
    if (statusFilter === 'ALL') return matchesSearch
    if (statusFilter === 'AVAILABLE') return matchesSearch && (d.status === 'ACTIVE' || d.isAvailable)
    if (statusFilter === 'ON_TRIP') return matchesSearch && (d.status === 'ON_RIDE' || d.status === 'ON_TRIP' || d.status === 'BUSY')
    if (statusFilter === 'INACTIVE') return matchesSearch && (d.status === 'INACTIVE' || !d.isActive)
    return matchesSearch && d.status === statusFilter
  })

  // Quick Metrics
  const totalCount = drivers.length
  const availableCount = drivers.filter(d => d.isAvailable || d.status === 'ACTIVE').length
  const onTripCount = drivers.filter(d => d.status === 'ON_RIDE' || d.status === 'ON_TRIP' || d.status === 'BUSY').length
  const verifiedCount = drivers.filter(d => d.isVerified).length

  return (
    <PageLayout
      title="Fleet Driver Profiles"
      description="View full profiles, vehicle specifications, documents, and real-time operational status for company drivers."
      actions={
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            icon={RefreshCw} 
            onClick={fetchDrivers} 
            disabled={loading}
            className="text-xs font-semibold"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            icon={Compass} 
            onClick={() => navigate('/dispatcher/maps')}
            className="text-xs font-bold"
          >
            Live Driver Map
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* TOP KPI METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="stat-card p-4 border-t-4 border-t-taxi-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Fleet</span>
            <p className="text-3xl font-black text-text-primary mt-1">{totalCount}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Registered Company Drivers</p>
          </div>
          <div className="stat-card p-4 border-t-4 border-t-emerald-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Available Now</span>
            <p className="text-3xl font-black text-emerald-600 mt-1">{availableCount}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Ready for Dispatch
            </p>
          </div>
          <div className="stat-card p-4 border-t-4 border-t-amber-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">On Trip / Busy</span>
            <p className="text-3xl font-black text-amber-600 mt-1">{onTripCount}</p>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span> Active Passenger Rides
            </p>
          </div>
          <div className="stat-card p-4 border-t-4 border-t-sky-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Verified Status</span>
            <p className="text-3xl font-black text-sky-600 mt-1">{verifiedCount}</p>
            <p className="text-[11px] text-text-muted mt-0.5">Approved & Licensed</p>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-surface rounded-2xl p-4 border border-border-subtle shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search driver by name, phone, plate, or vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border-subtle bg-slate-50/50 focus:bg-white focus:border-taxi-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['ALL', 'AVAILABLE', 'ON_TRIP', 'INACTIVE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-taxi-500 text-white shadow-xs'
                    : 'bg-slate-100 text-text-secondary hover:text-text-primary hover:bg-slate-200/70'
                }`}
              >
                {st === 'ALL' ? 'All Drivers' : st === 'AVAILABLE' ? 'Available' : st === 'ON_TRIP' ? 'On Trip' : 'Inactive'}
              </button>
            ))}
          </div>
        </div>

        {/* DRIVERS GRID */}
        {loading ? (
          <div className="py-20 text-center">
            <Loading label="Loading company driver fleet..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-200">
            <p className="text-sm font-bold text-rose-800">{error}</p>
            <Button size="sm" variant="secondary" onClick={fetchDrivers} className="mt-3">
              Retry
            </Button>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="py-16 text-center bg-surface rounded-2xl border border-dashed border-border-subtle">
            <Car size={36} className="mx-auto mb-2 text-text-muted opacity-40" />
            <p className="text-sm font-bold text-text-primary">No drivers found</p>
            <p className="text-xs text-text-muted mt-1">Try adjusting your search terms or status filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map((driver) => {
              const dId = driver._id || driver.id
              const name = driver.fullName || driver.name || 'Unnamed Driver'
              const isFree = driver.status === 'ACTIVE' || driver.isAvailable
              const isOnTrip = driver.status === 'ON_RIDE' || driver.status === 'ON_TRIP' || driver.status === 'BUSY'
              const avatar = driver.avatar || 'https://st2.depositphotos.com/1006318/5909/v/450/depositphotos_59094701-stock-illustration-businessman-profile-icon.jpg'

              return (
                <div
                  key={dId}
                  className="bg-surface rounded-2xl p-5 border border-border-subtle shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    {/* Header: Avatar, Name, Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatar}
                          alt={name}
                          className="w-12 h-12 rounded-xl object-cover border border-border-subtle shadow-xs"
                          onError={(e) => {
                            e.target.src = 'https://st2.depositphotos.com/1006318/5909/v/450/depositphotos_59094701-stock-illustration-businessman-profile-icon.jpg'
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-sm text-text-primary group-hover:text-taxi-600 transition-colors">
                              {name}
                            </h3>
                            {driver.isVerified && (
                              <ShieldCheck size={14} className="text-sky-500 shrink-0" title="Verified Driver" />
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5">
                            {driver.preferredServiceArea ? `Zone: ${driver.preferredServiceArea}` : 'Fleet Driver'}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase flex items-center gap-1.5 shrink-0 ${
                        isFree
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isOnTrip
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isFree ? 'bg-emerald-500' : isOnTrip ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                        {isFree ? 'AVAILABLE' : (isOnTrip ? 'ON TRIP' : (driver.status || 'OFFLINE'))}
                      </span>
                    </div>

                    {/* Vehicle & Plate Info */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-50/70 border border-border-subtle/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-text-muted font-medium flex items-center gap-1.5">
                          <Car size={13} className="text-taxi-500" /> Vehicle
                        </span>
                        <span className="font-bold text-text-primary">
                          {driver.make ? `${driver.make} ${driver.modelAndYear || ''}` : (driver.vehicleType || 'Sedan')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-text-muted font-medium">Plate No.</span>
                        <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-border-subtle">
                          {driver.vehicleRegistrationNumber || 'Not Registered'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-text-muted font-medium">License No.</span>
                        <span className="font-mono text-text-secondary text-[11px]">
                          {driver.licenseNumber || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="mt-3 space-y-1 text-xs text-text-secondary">
                      {driver.phoneNumber && (
                        <p className="flex items-center gap-2 text-[11px]">
                          <Phone size={12} className="text-text-muted shrink-0" />
                          <a href={`tel:${driver.phoneNumber}`} className="hover:text-taxi-500 font-semibold transition-colors">
                            {driver.phoneNumber}
                          </a>
                        </p>
                      )}
                      {driver.email && (
                        <p className="flex items-center gap-2 text-[11px] truncate">
                          <Mail size={12} className="text-text-muted shrink-0" />
                          <span className="truncate">{driver.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-3 border-t border-border-subtle flex items-center gap-2">
                    <Button
                      size="xs"
                      variant="secondary"
                      icon={Eye}
                      onClick={() => setSelectedDriver(driver)}
                      className="flex-1 text-xs font-semibold"
                    >
                      Quick Profile
                    </Button>
                    <Button
                      size="xs"
                      icon={ExternalLink}
                      onClick={() => navigate(`/dispatcher/drivers/${dId}`)}
                      className="flex-1 text-xs font-semibold"
                    >
                      Full Profile
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* DRIVER QUICK PROFILE MODAL */}
        {selectedDriver && (
          <Modal
            open={true}
            isOpen={true}
            onClose={() => setSelectedDriver(null)}
            title={`Driver Profile: ${selectedDriver.fullName || selectedDriver.name}`}
          >
            <div className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-border-subtle">
                <img
                  src={selectedDriver.avatar || 'https://st2.depositphotos.com/1006318/5909/v/450/depositphotos_59094701-stock-illustration-businessman-profile-icon.jpg'}
                  alt={selectedDriver.fullName}
                  className="w-16 h-16 rounded-xl object-cover border border-border-subtle shadow-xs"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-text-primary">
                      {selectedDriver.fullName || selectedDriver.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {selectedDriver.status || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    {selectedDriver.role || 'DRIVER'} • Registered on {new Date(selectedDriver.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                  <p className="text-[11px] text-text-secondary font-medium">
                    Phone: <strong className="text-text-primary">{selectedDriver.phoneNumber}</strong> • Email: <strong className="text-text-primary">{selectedDriver.email}</strong>
                  </p>
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Vehicle Specifications */}
                <div className="p-3.5 rounded-xl border border-border-subtle bg-white space-y-2">
                  <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5 border-b border-border-subtle pb-1.5">
                    <Car size={14} className="text-taxi-500" /> Vehicle Information
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-text-muted">Vehicle Type:</span>
                      <span className="font-semibold text-text-primary">{selectedDriver.vehicleType || 'Sedan'}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-text-muted">Registration Plate:</span>
                      <span className="font-mono font-bold text-text-primary">{selectedDriver.vehicleRegistrationNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-text-muted">Make & Model:</span>
                      <span className="font-semibold text-text-primary">{selectedDriver.make ? `${selectedDriver.make} ${selectedDriver.modelAndYear || ''}` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-text-muted">Fuel / Transmission:</span>
                      <span className="font-semibold text-text-primary">{selectedDriver.fuelType || 'Petrol'} • {selectedDriver.transmission || 'Manual'}</span>
                    </div>
                  </div>
                </div>

                {/* Driving License & Compliance */}
                <div className="p-3.5 rounded-xl border border-border-subtle bg-white space-y-2">
                  <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5 border-b border-border-subtle pb-1.5">
                    <FileText size={14} className="text-sky-500" /> Driving License & Area
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-text-muted">License Number:</span>
                      <span className="font-mono font-bold text-text-primary">{selectedDriver.licenseNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-text-muted">License Class:</span>
                      <span className="font-semibold text-text-primary">{selectedDriver.licenseClass || 'Commercial'}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-100">
                      <span className="text-text-muted">Expiry Date:</span>
                      <span className="font-semibold text-text-primary">{selectedDriver.expiryDate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-text-muted">Service Zone:</span>
                      <span className="font-semibold text-text-primary">{selectedDriver.preferredServiceArea || 'All Zones'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Previews */}
              <div className="p-3.5 rounded-xl border border-border-subtle bg-white space-y-2.5">
                <h4 className="font-bold text-xs text-text-primary flex items-center gap-1.5 border-b border-border-subtle pb-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" /> Uploaded Verification Documents
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Government ID', url: selectedDriver.governmentIdUrl },
                    { label: 'License Copy', url: selectedDriver.licenseCopyUrl },
                    { label: 'Vehicle Registration', url: selectedDriver.vehicleRegistrationDocUrl },
                    { label: 'Insurance Proof', url: selectedDriver.insuranceProofUrl },
                  ].map((doc) => (
                    <div key={doc.label} className="p-2 rounded-lg bg-slate-50 border border-border-subtle text-center">
                      <p className="text-[10px] font-bold text-text-muted truncate mb-1">{doc.label}</p>
                      {doc.url ? (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block group">
                          <img
                            src={doc.url}
                            alt={doc.label}
                            className="h-14 w-full object-cover rounded border border-border-subtle group-hover:opacity-80 transition-opacity"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                          <span className="text-[10px] text-taxi-600 font-bold block mt-1 hover:underline">View File</span>
                        </a>
                      ) : (
                        <p className="text-[10px] text-text-muted italic py-2">Not Uploaded</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-border-subtle">
                <Button variant="secondary" onClick={() => setSelectedDriver(null)}>
                  Close
                </Button>
                <Button
                  icon={ExternalLink}
                  onClick={() => {
                    const id = selectedDriver._id || selectedDriver.id
                    setSelectedDriver(null)
                    navigate(`/dispatcher/drivers/${id}`)
                  }}
                >
                  Open Full Profile
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </PageLayout>
  )
}
