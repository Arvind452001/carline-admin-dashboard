import { useState, useMemo } from 'react'
import {
  BrainCircuit, MapPin, Activity, History, Plus, Search,
  Edit3, Trash2, HelpCircle, CheckCircle, XCircle,
  AlertTriangle, RotateCcw, TrendingUp, Sliders
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Modal from '@/shared/components/Modal'
import StatusBadge from '@/shared/components/StatusBadge'

export default function AITraining() {
  const [activeTab, setActiveTab] = useState('Dashboard')

  // Scopes / Date Filter States
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [dateRange, setDateRange] = useState('30days')

  // --- Initial Mock Data States ---

  // Locations Knowledge Database
  const [locations, setLocations] = useState([
    { id: 1, type: 'Street', name: 'MG Road', alias: 'Mahatma Gandhi Road', area: 'Central Indore', confidence: 98, status: 'Approved', updated: '16 Aug 2026' },
    { id: 2, type: 'Landmark', name: 'Rajwada', alias: 'Rajwada Palace Area', area: 'Old Town', confidence: 96, status: 'Approved', updated: '15 Aug 2026' },
    { id: 3, type: 'Business', name: 'ABC Mall', alias: 'ABC Shopping Plaza', area: 'Vijay Nagar', confidence: 91, status: 'Approved', updated: '14 Aug 2026' },
    { id: 4, type: 'Building', name: 'City Hospital', alias: 'CH Junction', area: 'LIG Colony', confidence: 89, status: 'Approved', updated: '12 Aug 2026' }
  ])

  // Uncertain Locations Review Queue
  const [uncertainLocations, setUncertainLocations] = useState([
    { bookingId: 'BK-10245', input: 'Rajwada Near By ABC shop', confidence: 72, originalInterpretation: 'ABC Shop, MG Road', status: 'Pending' },
    { bookingId: 'BK-10251', input: 'Bada Ganpati Mandir left road', confidence: 68, originalInterpretation: 'Ganpati Chowk, Airport Road', status: 'Under Review' },
    { bookingId: 'BK-10270', input: 'Old Palasia square near Apollo tower', confidence: 64, originalInterpretation: 'Apollo Hospital Lane', status: 'Pending' }
  ])

  // AI Audit History logs
  const [auditLogs, setAuditLogs] = useState([
    { date: '17 Aug 2026', user: 'Super Admin', location: 'Rajwada', action: 'Correction Approved', prev: 'MG Road', current: 'Rajwada Main Road', reason: 'Local nickname correction' },
    { date: '16 Aug 2026', user: 'Company Admin', location: 'ABC Mall', action: 'Alias Modified', prev: 'ABC Store', current: 'ABC Shopping Plaza', reason: 'Official business naming alignment' },
    { date: '15 Aug 2026', user: 'Super Admin', location: 'City Hospital', action: 'Location Approved', prev: 'CH Area', current: 'CH Junction', reason: 'Initial AI mapping verification' }
  ])

  // Filters State for Location Knowledge
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [confidenceFilter, setConfidenceFilter] = useState('all')

  // --- Modals & Forms State ---
  const [showAddLocationModal, setShowAddLocationModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [locationForm, setLocationForm] = useState({
    type: 'Landmark',
    name: '',
    alias: '',
    spellings: '',
    pronunciation: '',
    address: '',
    serviceArea: 'Central Indore',
    status: 'Active'
  })

  // Review Queue state
  const [selectedReview, setSelectedReview] = useState(null)
  const [correctedPickup, setCorrectedPickup] = useState('')
  const [correctedAddress, setCorrectedAddress] = useState('')
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [approveReason, setApproveReason] = useState('')
  const [saveForFuture, setSaveForFuture] = useState(true)

  // Version History State
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [selectedVersionLocation, setSelectedVersionLocation] = useState(null)
  const [versionHistory] = useState([
    { version: 'v3', date: 'Aug 17, 2026', updatedBy: 'Super Admin', status: 'Current' },
    { version: 'v2', date: 'Aug 10, 2026', updatedBy: 'Company Admin', status: 'Previous' },
    { version: 'v1', date: 'Aug 01, 2026', updatedBy: 'Original AI Mapping', status: 'Previous' }
  ])
  const [showRollbackConfirm, setShowRollbackConfirm] = useState(false)
  const [rollbackReason, setRollbackReason] = useState('')
  const [rollbackTargetVersion, setRollbackTargetVersion] = useState(null)

  // --- Functions ---
  const handleOpenAddLocation = () => {
    setEditingLocation(null)
    setLocationForm({
      type: 'Landmark',
      name: '',
      alias: '',
      spellings: '',
      pronunciation: '',
      address: '',
      serviceArea: 'Central Indore',
      status: 'Active'
    })
    setShowAddLocationModal(true)
  }

  const handleEditLocation = (loc) => {
    setEditingLocation(loc)
    setLocationForm({
      type: loc.type,
      name: loc.name,
      alias: loc.alias,
      spellings: loc.alias,
      pronunciation: loc.name,
      address: loc.area,
      serviceArea: loc.area,
      status: loc.status === 'Approved' ? 'Active' : 'Inactive'
    })
    setShowAddLocationModal(true)
  }

  const handleSaveLocation = (e) => {
    e.preventDefault()
    if (editingLocation) {
      setLocations(prev => prev.map(item => item.id === editingLocation.id ? {
        ...item,
        type: locationForm.type,
        name: locationForm.name,
        alias: locationForm.alias,
        area: locationForm.serviceArea,
        status: locationForm.status === 'Active' ? 'Approved' : 'Pending'
      } : item))
    } else {
      setLocations(prev => [
        ...prev,
        {
          id: prev.length + 1,
          type: locationForm.type,
          name: locationForm.name,
          alias: locationForm.alias,
          area: locationForm.serviceArea,
          confidence: 100,
          status: 'Approved',
          updated: 'Today'
        }
      ])
    }
    setShowAddLocationModal(false)
  }

  const handleOpenReview = (item) => {
    setSelectedReview(item)
    setCorrectedPickup(item.originalInterpretation)
    setCorrectedAddress('')
  }

  const handleTriggerApproveCorrection = () => {
    setShowApproveConfirm(true)
  }

  const handleConfirmCorrectionApproval = () => {
    // Add to audit logs
    setAuditLogs(prev => [
      {
        date: 'Today',
        user: 'Super Admin',
        location: selectedReview.bookingId,
        action: 'Correction Approved',
        prev: selectedReview.originalInterpretation,
        current: correctedPickup,
        reason: approveReason
      },
      ...prev
    ])

    // Save to verified location knowledge if checked
    if (saveForFuture) {
      setLocations(prev => [
        ...prev,
        {
          id: prev.length + 1,
          type: 'Alias',
          name: correctedPickup,
          alias: selectedReview.input,
          area: correctedAddress || 'Assigned Area',
          confidence: 100,
          status: 'Approved',
          updated: 'Today'
        }
      ])
    }

    // Remove from review queue
    setUncertainLocations(prev => prev.filter(q => q.bookingId !== selectedReview.bookingId))

    setShowApproveConfirm(false)
    setSelectedReview(null)
  }

  // Filtered Location Knowledge list
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || loc.alias.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === 'all' || loc.type === typeFilter
      const matchesStatus = statusFilter === 'all' || loc.status === statusFilter

      let matchesConfidence = true
      if (confidenceFilter === 'high') matchesConfidence = loc.confidence >= 95
      if (confidenceFilter === 'medium') matchesConfidence = loc.confidence >= 85 && loc.confidence < 95
      if (confidenceFilter === 'low') matchesConfidence = loc.confidence < 85

      return matchesSearch && matchesType && matchesStatus && matchesConfidence
    })
  }, [locations, searchQuery, typeFilter, statusFilter, confidenceFilter])

  return (
    <PageLayout
      title="AI Training & Location Correction"
      description="Manage customer transcription aliases, verify uncertain location mappings, and optimize spatial route accuracy."
      actions={
        <div className="flex gap-2">
          <Button icon={Plus} onClick={handleOpenAddLocation}>
            Add Location
          </Button>
        </div>
      }
    >
      {/* Top filter section */}
      <div className="glass-card p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-text-secondary uppercase block tracking-wider font-mono">Administration Filters</span>
          <div className="flex gap-3 mt-2">
            <div className="w-44">
              <Select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                options={[
                  { value: 'all', label: 'All Companies' },
                  { value: 'abc', label: 'ABC Taxi' },
                  { value: 'xyz', label: 'XYZ Cabs' }
                ]}
              />
            </div>
            <div className="w-40">
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={[
                  { value: 'today', label: 'Today' },
                  { value: '7days', label: 'Last 7 Days' },
                  { value: '30days', label: 'Last 30 Days' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border-strong overflow-x-auto pb-px mb-6 scrollbar-none">
        {['Dashboard', 'Location Knowledge', 'Uncertain Reviews', 'Audit Logs', 'Performance & Accuracy'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-all ${activeTab === t
                ? 'border-taxi-500 text-taxi-500'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-subtle'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">

        {/* --- Dashboard Tab --- */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-center">
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-text-muted">Location Records</span>
                <p className="text-xl font-black text-text-primary mt-1">12,450</p>
              </div>
              <div className="glass-card p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <span className="text-xs text-amber-600">Pending Reviews</span>
                <p className="text-xl font-black text-amber-600 mt-1">{uncertainLocations.length}</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-text-muted">Approved Corrections</span>
                <p className="text-xl font-black text-emerald-600 mt-1">11,820</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-text-muted">AI Confidence</span>
                <p className="text-xl font-black text-text-primary mt-1">94.2%</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-text-muted">Uncertain Locations</span>
                <p className="text-xl font-black text-text-primary mt-1">85</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-text-muted">Rolled Back</span>
                <p className="text-xl font-black text-signal-red mt-1">12</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">AI Interpretation Rates</h3>
                <div className="space-y-3 mt-2 text-xs font-semibold">
                  <div>
                    <div className="flex justify-between text-text-secondary mb-1">
                      <span>Address Accuracy</span>
                      <span>94.2%</span>
                    </div>
                    <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden">
                      <div className="bg-taxi-500 h-full rounded-full" style={{ width: '94.2%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-text-secondary mb-1">
                      <span>Correction Ratio</span>
                      <span>5.8%</span>
                    </div>
                    <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '5.8%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Quick Action Prompts</h3>
                <p className="text-xs text-text-muted">There are {uncertainLocations.length} locations flagged for review with low AI matching accuracy.</p>
                <div className="mt-3">
                  <Button size="sm" icon={Activity} onClick={() => setActiveTab('Uncertain Reviews')}>
                    Go to Verification Queue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Location Knowledge Tab --- */}
        {activeTab === 'Location Knowledge' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <div>
                <h3 className="text-base font-bold text-text-primary">Locations Alias Database</h3>
                <p className="text-xs text-text-muted mt-0.5">Define local abbreviations, spellings, and custom coordinates.</p>
              </div>
              <Button size="sm" icon={Plus} onClick={handleOpenAddLocation}>+ Add Location</Button>
            </div>

            {/* Filters header */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input
                placeholder="Search name, alias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'Street', label: 'Street' },
                  { value: 'Landmark', label: 'Landmark' },
                  { value: 'Business', label: 'Business' },
                  { value: 'Building', label: 'Building' },
                  { value: 'Alias', label: 'Alias / Nickname' }
                ]}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Pending', label: 'Pending Review' }
                ]}
              />
              <Select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Confidence levels' },
                  { value: 'high', label: 'High (>=95%)' },
                  { value: 'medium', label: 'Medium (85%-95%)' },
                  { value: 'low', label: 'Low (<85%)' }
                ]}
              />
              <Select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                options={[
                  { value: 'all', label: 'All Companies' },
                  { value: 'abc', label: 'ABC Taxi' },
                  { value: 'xyz', label: 'XYZ Cabs' }
                ]}
              />
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Alias / Nickname</th>
                    <th className="py-2.5 px-3">Service Area</th>
                    <th className="py-2.5 px-3">AI Confidence</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Updated</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-xs">
                  {filteredLocations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-text-secondary">{loc.type}</td>
                      <td className="py-3 px-3 font-bold text-text-primary">{loc.name}</td>
                      <td className="py-3 px-3">{loc.alias || '—'}</td>
                      <td className="py-3 px-3">{loc.area}</td>
                      <td className="py-3 px-3">
                        <span className={`font-mono font-bold ${loc.confidence >= 90 ? 'text-emerald-600' : 'text-amber-500'}`}>
                          {loc.confidence}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold ring-1 ring-inset ${loc.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' : 'bg-amber-500/10 text-amber-600 ring-amber-500/20'
                          }`}>
                          {loc.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-text-muted">{loc.updated}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex gap-1 items-center justify-end">
                          <button
                            onClick={() => handleEditLocation(loc)}
                            title="Edit Location"
                            className="p-1 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVersionLocation(loc)
                              setShowVersionModal(true)
                            }}
                            title="Versions"
                            className="p-1 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
                          >
                            <History size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Uncertain Reviews Tab --- */}
        {activeTab === 'Uncertain Reviews' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">Uncertain Locations review queue</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Booking ID</th>
                    <th className="py-2.5 px-3">Transcription (Customer said)</th>
                    <th className="py-2.5 px-3">AI Interpretation</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-xs">
                  {uncertainLocations.map((item) => (
                    <tr key={item.bookingId} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-taxi-500">{item.bookingId}</td>
                      <td className="py-3 px-3 italic">"{item.input}"</td>
                      <td className="py-3 px-3">{item.originalInterpretation}</td>
                      <td className="py-3 px-3">
                        <span className="text-red-500 font-bold font-mono">{item.confidence}%</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-inset ring-amber-500/20">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button size="xs" onClick={() => handleOpenReview(item)}>Review</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Split Screen AI Review Section when selected */}
            {selectedReview && (
              <div className="border border-border-strong rounded-2xl p-6 bg-surface mt-6 space-y-4">
                <h3 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2 flex items-center gap-1.5"><BrainCircuit size={18} className="text-taxi-500" /> AI Interpretation Review</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">

                  {/* Left panel: Info */}
                  <div className="space-y-3 bg-background p-4 rounded-xl border border-border-subtle">
                    <div>
                      <span className="text-text-muted block uppercase text-[10px] font-bold">Booking Details</span>
                      <p className="font-bold text-text-primary mt-1">{selectedReview.bookingId}</p>
                    </div>
                    <div>
                      <span className="text-text-muted block uppercase text-[10px] font-bold">Transcription Input</span>
                      <p className="font-semibold text-text-primary mt-1 italic">"{selectedReview.input}"</p>
                    </div>
                    <div className="border-t border-border-subtle pt-2">
                      <span className="text-text-muted block uppercase text-[10px] font-bold">AI Pickup interpretation</span>
                      <p className="font-bold text-text-primary mt-1">{selectedReview.originalInterpretation}</p>
                    </div>
                    <div>
                      <span className="text-text-muted block uppercase text-[10px] font-bold">Matching confidence</span>
                      <p className="text-signal-red font-bold font-mono text-sm mt-0.5">⚠️ {selectedReview.confidence}% (Uncertain Interpretation)</p>
                    </div>
                  </div>

                  {/* Right panel: Editor */}
                  <div className="space-y-4">
                    <span className="text-text-muted block uppercase text-[10px] font-bold">Administrator Correction</span>

                    <Input
                      label="Correct Pickup Name *"
                      required
                      value={correctedPickup}
                      onChange={(e) => setCorrectedPickup(e.target.value)}
                      placeholder="e.g. ABC Shop - Rajwada Main Road"
                    />

                    <Input
                      label="Correct Address Details"
                      value={correctedAddress}
                      onChange={(e) => setCorrectedAddress(e.target.value)}
                      placeholder="e.g. Rajwada, Indore"
                    />

                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="secondary" onClick={() => setSelectedReview(null)}>Reject & Cancel</Button>
                      <Button onClick={handleTriggerApproveCorrection}>Approve Correction</Button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Audit Logs Tab --- */}
        {activeTab === 'Audit Logs' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">AI Training Audit</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">User Role</th>
                    <th className="py-2.5 px-3">Location Reference</th>
                    <th className="py-2.5 px-3">Action Description</th>
                    <th className="py-2.5 px-3">Previous Map</th>
                    <th className="py-2.5 px-3">New Mapped Value</th>
                    <th className="py-2.5 px-3 text-right">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-xs">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-text-muted">{log.date}</td>
                      <td className="py-3 px-3">{log.user}</td>
                      <td className="py-3 px-3 font-bold text-text-primary">{log.location}</td>
                      <td className="py-3 px-3 font-semibold text-taxi-500">{log.action}</td>
                      <td className="py-3 px-3 text-signal-red font-mono">{log.prev}</td>
                      <td className="py-3 px-3 text-emerald-600 font-mono">{log.current}</td>
                      <td className="py-3 px-3 text-right text-text-secondary italic">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Performance Tab --- */}
        {activeTab === 'Performance & Accuracy' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">AI Performance metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-surface p-4 rounded-xl border border-border-subtle">
                  <span className="text-xs text-text-muted">Location Interpretation</span>
                  <p className="text-xl font-bold text-text-primary mt-1">94.2%</p>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border-subtle">
                  <span className="text-xs text-text-muted">Correction Rate</span>
                  <p className="text-xl font-bold text-amber-500 mt-1">5.8%</p>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border-subtle">
                  <span className="text-xs text-text-muted">Uncertain Rate</span>
                  <p className="text-xl font-bold text-signal-red mt-1">2.4%</p>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border-subtle">
                  <span className="text-xs text-text-muted">Approved Corrections</span>
                  <p className="text-xl font-bold text-emerald-600 mt-1">11,820</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Accuracy Distribution Over Time</h3>
              <div className="h-44 flex items-end gap-2 pt-6">
                {[45, 62, 58, 70, 85, 91, 94].map((h, i) => (
                  <div key={i} className="flex-1 bg-taxi-500/20 hover:bg-taxi-500 rounded-t-lg transition-all" style={{ height: `${h}%` }} title={`Week ${i + 1}: ${h}%`}>
                    <div className="text-[10px] font-bold text-center -mt-5 font-mono text-text-secondary">{h}%</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-text-muted px-2 font-mono">
                <span>June</span>
                <span>July</span>
                <span>August (Current)</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- Add / Edit Location Modal --- */}
      <Modal
        open={showAddLocationModal}
        onClose={() => setShowAddLocationModal(false)}
        title={editingLocation ? "Edit Location Details" : "Add Location Knowledge"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddLocationModal(false)}>Cancel</Button>
            <Button onClick={handleSaveLocation}>Save Location</Button>
          </>
        }
      >
        <form className="space-y-4 text-xs pr-1 max-h-[70vh] overflow-y-auto">
          <Select
            label="Location Type"
            value={locationForm.type}
            onChange={(e) => setLocationForm(prev => ({ ...prev, type: e.target.value }))}
            options={[
              { value: 'Street', label: 'Street' },
              { value: 'Landmark', label: 'Landmark' },
              { value: 'Business', label: 'Business' },
              { value: 'Building', label: 'Building' },
              { value: 'School', label: 'School' },
              { value: 'Entrance', label: 'Entrance' }
            ]}
          />

          <Input
            label="Name *"
            required
            value={locationForm.name}
            onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Rajwada"
          />

          <Input
            label="Alias / Local Name"
            value={locationForm.alias}
            onChange={(e) => setLocationForm(prev => ({ ...prev, alias: e.target.value }))}
            placeholder="e.g. Rajwada Palace"
          />

          <Input
            label="Alternate Spellings"
            value={locationForm.spellings}
            onChange={(e) => setLocationForm(prev => ({ ...prev, spellings: e.target.value }))}
            placeholder="Comma separated: Rajvada, Rajwada Palace"
          />

          <Input
            label="Pronunciation String"
            value={locationForm.pronunciation}
            onChange={(e) => setLocationForm(prev => ({ ...prev, pronunciation: e.target.value }))}
            placeholder="e.g. [ Raj-wa-da ]"
          />

          <Input
            label="Address"
            value={locationForm.address}
            onChange={(e) => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Street and landmark details..."
          />

          <Select
            label="Service Area"
            value={locationForm.serviceArea}
            onChange={(e) => setLocationForm(prev => ({ ...prev, serviceArea: e.target.value }))}
            options={[
              { value: 'Central Indore', label: 'Central Indore' },
              { value: 'Vijay Nagar Area', label: 'Vijay Nagar Area' },
              { value: 'Palasia Junction', label: 'Palasia Junction' }
            ]}
          />

          <Select
            label="Status"
            value={locationForm.status}
            onChange={(e) => setLocationForm(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' }
            ]}
          />
        </form>
      </Modal>

      {/* --- Approve AI Correction Modal confirmation --- */}
      <Modal
        open={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        title="Approve AI Correction"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowApproveConfirm(false)}>Cancel</Button>
            <Button onClick={handleConfirmCorrectionApproval}>Approve & Save</Button>
          </>
        }
      >
        <div className="space-y-4 text-xs pr-1">
          <div className="bg-surface p-3 rounded-lg space-y-1.5 border border-border-subtle">
            <p className="text-text-muted">Original Interpretation: <span className="font-semibold text-signal-red font-mono">{selectedReview?.originalInterpretation}</span></p>
            <p className="text-text-muted">Correct Interpretation: <span className="font-semibold text-emerald-600 font-mono">{correctedPickup}</span></p>
          </div>

          <Input
            label="Reason for Correction Approval *"
            required
            value={approveReason}
            onChange={(e) => setApproveReason(e.target.value)}
            placeholder="e.g. Local nickname / landmark correction"
          />

          <label className="flex items-center gap-2 cursor-pointer font-medium text-text-primary pt-1">
            <input
              type="checkbox"
              checked={saveForFuture}
              onChange={(e) => setSaveForFuture(e.target.checked)}
              className="w-4 h-4 text-taxi-500 border-border-strong focus:ring-taxi-500"
            />
            Save corrected alias configuration for future bookings
          </label>
        </div>
      </Modal>

      {/* --- Location Version History Modal --- */}
      <Modal
        open={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        title={`Version History: ${selectedVersionLocation?.name}`}
        footer={<Button variant="secondary" onClick={() => setShowVersionModal(false)}>Close</Button>}
      >
        <div className="space-y-4 text-xs pr-1">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Updated By</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {versionHistory.map((v, i) => (
                <tr key={i} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-taxi-500">{v.version}</td>
                  <td className="py-3 px-3">{v.date}</td>
                  <td className="py-3 px-3">{v.updatedBy}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${v.status === 'Current' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface border border-border-subtle'}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Button size="xs" variant="secondary" className="px-1.5 py-0.5 text-[10px]">Compare</Button>
                      {v.status !== 'Current' && (
                        <Button size="xs" onClick={() => {
                          setRollbackTargetVersion(v.version)
                          setShowRollbackConfirm(true)
                        }} className="px-1.5 py-0.5 text-[10px]">Rollback</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* --- Confirm Rollback Modal --- */}
      <Modal
        open={showRollbackConfirm}
        onClose={() => setShowRollbackConfirm(false)}
        title="Confirm Version Rollback"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRollbackConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => {
              setShowRollbackConfirm(false)
              setShowVersionModal(false)
            }}>Confirm Rollback</Button>
          </>
        }
      >
        <div className="space-y-4 text-xs pr-1">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-3 rounded-lg flex items-start gap-2">
            <AlertTriangle size={16} />
            <span>This action will revert the location configurations to version {rollbackTargetVersion} and make it the active approved version.</span>
          </div>

          <Input
            label="Rollback Reason *"
            required
            value={rollbackReason}
            onChange={(e) => setRollbackReason(e.target.value)}
            placeholder="State reasons for version rollback..."
          />
        </div>
      </Modal>

    </PageLayout>
  )
}
