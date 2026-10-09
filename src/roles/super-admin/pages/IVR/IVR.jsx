import { useState, useMemo } from 'react'
import { 
  Phone, PhoneCall, Volume2, Layers, Activity, History, Plus, 
  Trash2, Edit2, Play, ArrowUp, ArrowDown, RefreshCw, Search, 
  CheckCircle, XCircle, Info, Mic, Sliders, Check
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Modal from '@/shared/components/Modal'
import StatusBadge from '@/shared/components/StatusBadge'

export default function IVR() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('Dashboard')
  
  // Scope / Multi-Company State
  const [scopeType, setScopeType] = useState('default') // 'default' or 'company'
  const [selectedCompany, setSelectedCompany] = useState('ABC Taxi')

  // --- Initial Mock Data States ---
  
  // Customer IVR Options
  const [customerOptions, setCustomerOptions] = useState([
    { id: 1, key: 1, name: 'Book a Ride', action: 'Book Ride', prompt: 'customer_book_ride_v3.mp3', status: 'Active' },
    { id: 2, key: 2, name: 'Check Booking', action: 'Check Booking', prompt: 'customer_check_booking_v1.mp3', status: 'Active' },
    { id: 3, key: 3, name: 'Cancel Booking', action: 'Cancel Booking', prompt: 'customer_cancel_v2.mp3', status: 'Active' },
    { id: 4, key: 4, name: 'Payment Assistance', action: 'Transfer to Support', prompt: 'customer_payment_help_v1.mp3', status: 'Active' },
    { id: 5, key: 5, name: 'Speak to Support', action: 'Transfer to Support', prompt: 'customer_support_v2.mp3', status: 'Active' },
    { id: 6, key: 6, name: 'Repeat Menu', action: 'Play Information', prompt: 'customer_repeat_menu_v1.mp3', status: 'Active' }
  ])

  // Driver IVR Options
  const [driverOptions, setDriverOptions] = useState([
    { id: 1, key: 1, name: 'Available Trips', action: 'Get Available Trips', prompt: 'driver_avail_trips_v2.mp3', status: 'Active' },
    { id: 2, key: 2, name: 'Current Trip', action: 'Current Trip', prompt: 'driver_current_trip_v1.mp3', status: 'Active' },
    { id: 3, key: 3, name: 'Accept Trip', action: 'Accept Trip', prompt: 'driver_accept_trip_v1.mp3', status: 'Active' },
    { id: 4, key: 4, name: 'Reject Trip', action: 'Reject Trip', prompt: 'driver_reject_trip_v1.mp3', status: 'Active' },
    { id: 5, key: 5, name: 'Mark Arrived', action: 'Mark Arrived', prompt: 'driver_arrived_v1.mp3', status: 'Active' },
    { id: 6, key: 6, name: 'Start Trip', action: 'Start Trip', prompt: 'driver_start_trip_v1.mp3', status: 'Active' },
    { id: 7, key: 7, name: 'Complete Trip', action: 'Complete Trip', prompt: 'driver_complete_trip_v1.mp3', status: 'Active' },
    { id: 8, key: 8, name: 'Earnings', action: 'Get Earnings', prompt: 'driver_earnings_v2.mp3', status: 'Active' },
    { id: 9, key: 9, name: 'Dispatcher Support', action: 'Transfer to Dispatcher', prompt: 'driver_dispatcher_v1.mp3', status: 'Active' }
  ])

  // Voice Prompts
  const [voicePrompts, setVoicePrompts] = useState([
    { name: 'Welcome Message', type: 'Audio', version: 'v3', status: 'Active', file: 'welcome_v3.mp3' },
    { name: 'Available Trips', type: 'TTS', version: 'v2', status: 'Active', text: 'Press 1 to fetch available trips near you.' },
    { name: 'Trip Accepted', type: 'Recording', version: 'v1', status: 'Active', file: 'trip_accepted_v1.wav' },
    { name: 'Trip Completed', type: 'Audio', version: 'v4', status: 'Active', file: 'trip_completed_v4.mp3' }
  ])

  // Voice Prompt Version History (For selected prompt)
  const [versionPromptName, setVersionPromptName] = useState('')
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [versionHistory] = useState([
    { version: 'v3', date: 'Aug 17, 2026', updatedBy: 'Admin', status: 'Current' },
    { version: 'v2', date: 'Aug 10, 2026', updatedBy: 'Admin', status: 'Previous' },
    { version: 'v1', date: 'Aug 01, 2026', updatedBy: 'Admin', status: 'Previous' }
  ])
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [restoreTargetVersion, setRestoreTargetVersion] = useState(null)

  // Call History logs
  const [callHistory] = useState([
    { date: '17 Aug 2026', caller: '+1 415 555 2671', type: 'Driver', menu: 'Driver IVR', duration: '02:14', status: 'Success' },
    { date: '17 Aug 2026', caller: '+1 212 555 9018', type: 'Customer', menu: 'Customer IVR', duration: '01:42', status: 'Success' },
    { date: '17 Aug 2026', caller: '+1 312 555 4911', type: 'Driver', menu: 'Driver IVR', duration: '00:32', status: 'Failed' },
    { date: '16 Aug 2026', caller: '+1 415 555 8812', type: 'Customer', menu: 'Customer IVR', duration: '03:05', status: 'Success' }
  ])
  const [historySearch, setHistorySearch] = useState('')
  const [historyTypeFilter, setHistoryTypeFilter] = useState('all')
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all')

  // --- Modals State ---
  const [showAddOptionModal, setShowAddOptionModal] = useState(false)
  const [editingOption, setEditingOption] = useState(null)
  const [targetIvrType, setTargetIvrType] = useState('Driver') // 'Driver' or 'Customer'

  const [optionForm, setOptionForm] = useState({
    key: '1',
    name: '',
    action: 'Get Available Trips',
    prompt: 'Select Prompt',
    status: 'Active'
  })

  // Voice Prompt Add State
  const [showAddPromptModal, setShowAddPromptModal] = useState(false)
  const [promptForm, setPromptForm] = useState({
    name: '',
    method: 'tts', // 'upload', 'record', 'tts'
    language: 'English',
    voice: 'Female',
    text: '',
    file: null
  })
  
  // TTS & Preview states
  const [recordingStatus, setRecordingStatus] = useState('idle') // 'idle', 'recording', 'finished'
  const [ttsGenerated, setTtsGenerated] = useState(false)

  // --- IVR Flow Simulation Preview State ---
  const [simStep, setSimStep] = useState('idle') // 'idle', 'welcome', 'main_menu', 'key_pressed', 'ended'
  const [simDigit, setSimDigit] = useState('')
  const [simTextLog, setSimTextLog] = useState([])

  // --- Functions ---
  const handleOpenAddOption = (ivrType) => {
    setTargetIvrType(ivrType)
    setEditingOption(null)
    setOptionForm({
      key: (ivrType === 'Driver' ? driverOptions.length + 1 : customerOptions.length + 1).toString(),
      name: '',
      action: ivrType === 'Driver' ? 'Get Available Trips' : 'Book Ride',
      prompt: 'Select Prompt',
      status: 'Active'
    })
    setShowAddOptionModal(true)
  }

  const handleEditOption = (option, ivrType) => {
    setTargetIvrType(ivrType)
    setEditingOption(option)
    setOptionForm({
      key: option.key.toString(),
      name: option.name,
      action: option.action,
      prompt: option.prompt,
      status: option.status
    })
    setShowAddOptionModal(true)
  }

  const handleSaveOption = (e) => {
    e.preventDefault()
    const targetList = targetIvrType === 'Driver' ? driverOptions : customerOptions
    const setTargetList = targetIvrType === 'Driver' ? setDriverOptions : setCustomerOptions

    if (editingOption) {
      setTargetList(prev => prev.map(item => item.id === editingOption.id ? {
        ...item,
        key: parseInt(optionForm.key),
        name: optionForm.name,
        action: optionForm.action,
        prompt: optionForm.prompt,
        status: optionForm.status
      } : item))
    } else {
      setTargetList(prev => [
        ...prev,
        {
          id: prev.length + 1,
          key: parseInt(optionForm.key),
          name: optionForm.name,
          action: optionForm.action,
          prompt: optionForm.prompt,
          status: optionForm.status
        }
      ])
    }
    setShowAddOptionModal(false)
  }

  const handleDeleteOption = (id, ivrType) => {
    const setTargetList = ivrType === 'Driver' ? setDriverOptions : setCustomerOptions
    setTargetList(prev => prev.filter(item => item.id !== id))
  }

  const toggleOptionStatus = (id, ivrType) => {
    const setTargetList = ivrType === 'Driver' ? setDriverOptions : setCustomerOptions
    setTargetList(prev => prev.map(item => item.id === id ? {
      ...item,
      status: item.status === 'Active' ? 'Disabled' : 'Active'
    } : item))
  }

  const handleReorder = (idx, direction, ivrType) => {
    const list = ivrType === 'Driver' ? [...driverOptions] : [...customerOptions]
    const setTargetList = ivrType === 'Driver' ? setDriverOptions : setCustomerOptions
    if (direction === 'up' && idx > 0) {
      const temp = list[idx]
      list[idx] = list[idx - 1]
      list[idx - 1] = temp
    } else if (direction === 'down' && idx < list.length - 1) {
      const temp = list[idx]
      list[idx] = list[idx + 1]
      list[idx + 1] = temp
    }
    // Re-assign keys based on order
    const updated = list.map((item, index) => ({ ...item, key: index + 1 }))
    setTargetList(updated)
  }

  const handleSaveVoicePrompt = (e) => {
    e.preventDefault()
    setVoicePrompts(prev => [
      ...prev,
      {
        name: promptForm.name,
        type: promptForm.method.toUpperCase(),
        version: 'v1',
        status: 'Active',
        file: promptForm.method === 'upload' ? 'uploaded_audio.mp3' : 'generated_tts.mp3'
      }
    ])
    setShowAddPromptModal(false)
  }

  const handleTriggerSimulateDigit = (digit) => {
    setSimDigit(digit)
    const options = simStep === 'main_menu' ? driverOptions : []
    const match = options.find(o => o.key.toString() === digit.toString())
    if (match) {
      setSimTextLog(prev => [
        ...prev,
        { sender: 'user', text: `Pressed Digit ${digit}` },
        { sender: 'system', text: `Triggered Action: "${match.action}" playing prompt "${match.prompt}"` },
        { sender: 'system', text: `Flow simulation successful for ${match.name}.` }
      ])
      setSimStep('key_pressed')
    } else {
      setSimTextLog(prev => [
        ...prev,
        { sender: 'user', text: `Pressed Digit ${digit}` },
        { sender: 'system', text: `Invalid Option. Please try again.` }
      ])
    }
  }

  const startSimulator = () => {
    setSimStep('welcome')
    setSimTextLog([
      { sender: 'system', text: 'Incoming Call Simulating...' },
      { sender: 'system', text: 'Playing: Welcome message prompt ("Welcome to driver portal")' }
    ])
    setTimeout(() => {
      setSimStep('main_menu')
      setSimTextLog(prev => [
        ...prev,
        { sender: 'system', text: 'Main Menu active. Please select options 1 to 9 from Driver Menu.' }
      ])
    }, 1500)
  }

  // Filtered Call History
  const filteredHistory = useMemo(() => {
    return callHistory.filter(h => {
      const matchesSearch = h.caller.includes(historySearch)
      const matchesType = historyTypeFilter === 'all' || h.type.toLowerCase() === historyTypeFilter.toLowerCase()
      const matchesStatus = historyStatusFilter === 'all' || h.status.toLowerCase() === historyStatusFilter.toLowerCase()
      return matchesSearch && matchesType && matchesStatus
    })
  }, [callHistory, historySearch, historyTypeFilter, historyStatusFilter])

  return (
    <PageLayout 
      title="IVR Management" 
      description="Configure and manage interactive customer and driver telephone voice responder menus."
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" icon={History} onClick={() => setActiveTab('Call History')}>
            Call History
          </Button>
          <Button icon={Plus} onClick={() => handleOpenAddOption('Driver')}>
            Add Option
          </Button>
        </div>
      }
    >
      {/* Top Scope Selector Card */}
      <div className="glass-card p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-text-secondary uppercase block tracking-wider">IVR Configuration Scope</span>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-primary">
              <input 
                type="radio" 
                name="scope" 
                checked={scopeType === 'default'} 
                onChange={() => setScopeType('default')}
                className="text-taxi-500 focus:ring-taxi-500"
              />
              Platform Default
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text-primary">
              <input 
                type="radio" 
                name="scope" 
                checked={scopeType === 'company'} 
                onChange={() => setScopeType('company')}
                className="text-taxi-500 focus:ring-taxi-500"
              />
              Specific Company Scope
            </label>
          </div>
        </div>

        {scopeType === 'company' && (
          <div className="w-56">
            <Select 
              label="Selected Company" 
              value={selectedCompany} 
              onChange={(e) => setSelectedCompany(e.target.value)}
              options={[
                { value: 'ABC Taxi', label: 'ABC Taxi' },
                { value: 'XYZ Cabs', label: 'XYZ Cabs' },
                { value: 'City Ride', label: 'City Ride' }
              ]}
            />
          </div>
        )}
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border-strong overflow-x-auto pb-px mb-6 scrollbar-none">
        {['Dashboard', 'Customer IVR', 'Driver IVR', 'Menu Builder', 'Voice Prompts', 'IVR Preview', 'Call History'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === t
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-text-muted">Total Calls</span>
                <p className="text-2xl font-black text-text-primary mt-1">12,450</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-text-muted">Successful Calls</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">11,820</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-text-muted">Failed Calls</span>
                <p className="text-2xl font-black text-signal-red mt-1">630</p>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <span className="text-xs text-text-muted">Avg. Duration</span>
                <p className="text-2xl font-black text-text-primary mt-1">2m 18s</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Customer Menu Overview</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-text-muted">Status</span>
                    <p className="font-bold text-emerald-600 mt-1">Active</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Options Count</span>
                    <p className="font-bold text-text-primary mt-1">{customerOptions.length} Digit Routes</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Driver Menu Overview</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-text-muted">Status</span>
                    <p className="font-bold text-emerald-600 mt-1">Active</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Options Count</span>
                    <p className="font-bold text-text-primary mt-1">{driverOptions.length} Digit Routes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Customer IVR Tab --- */}
        {activeTab === 'Customer' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <div>
                <h3 className="text-base font-bold text-text-primary">Customer IVR Main Menu</h3>
                <p className="text-xs text-text-muted mt-0.5">Route configuration for incoming customer booking lines.</p>
              </div>
              <Button size="sm" icon={Plus} onClick={() => handleOpenAddOption('Customer')}>Add Option</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3 w-16">Digit</th>
                    <th className="py-2.5 px-3">Option Name</th>
                    <th className="py-2.5 px-3">Action Route</th>
                    <th className="py-2.5 px-3">Voice Prompt File</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-xs">
                  {customerOptions.map((opt, idx) => (
                    <tr key={opt.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-taxi-500">{opt.key}</td>
                      <td className="py-3 px-3 font-semibold text-text-primary">{opt.name}</td>
                      <td className="py-3 px-3">{opt.action}</td>
                      <td className="py-3 px-3 text-text-secondary italic">{opt.prompt}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={opt.status.toLowerCase()} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleReorder(idx, 'up', 'Customer')} className="p-1 text-text-muted hover:text-text-primary"><ArrowUp size={14} /></button>
                          <button onClick={() => handleReorder(idx, 'down', 'Customer')} className="p-1 text-text-muted hover:text-text-primary"><ArrowDown size={14} /></button>
                          <button onClick={() => handleEditOption(opt, 'Customer')} className="p-1 text-text-secondary hover:text-taxi-500"><Edit2 size={14} /></button>
                          <button onClick={() => toggleOptionStatus(opt.id, 'Customer')} className="p-1 text-text-secondary hover:text-emerald-500"><Sliders size={14} /></button>
                          <button onClick={() => handleDeleteOption(opt.id, 'Customer')} className="p-1 text-signal-red hover:text-red-700"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Driver IVR Tab --- */}
        {activeTab === 'Driver IVR' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <div>
                <h3 className="text-base font-bold text-text-primary">Driver IVR Main Menu</h3>
                <p className="text-xs text-text-muted mt-0.5">Automated bookings and alerts menu config for basic-phone drivers.</p>
              </div>
              <Button size="sm" icon={Plus} onClick={() => handleOpenAddOption('Driver')}>Add Option</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3 w-16">Digit</th>
                    <th className="py-2.5 px-3">Option Name</th>
                    <th className="py-2.5 px-3">Action Route</th>
                    <th className="py-2.5 px-3">Voice Prompt File</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-xs">
                  {driverOptions.map((opt, idx) => (
                    <tr key={opt.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-taxi-500">{opt.key}</td>
                      <td className="py-3 px-3 font-semibold text-text-primary">{opt.name}</td>
                      <td className="py-3 px-3">{opt.action}</td>
                      <td className="py-3 px-3 text-text-secondary italic">{opt.prompt}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={opt.status.toLowerCase()} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleReorder(idx, 'up', 'Driver')} className="p-1 text-text-muted hover:text-text-primary"><ArrowUp size={14} /></button>
                          <button onClick={() => handleReorder(idx, 'down', 'Driver')} className="p-1 text-text-muted hover:text-text-primary"><ArrowDown size={14} /></button>
                          <button onClick={() => handleEditOption(opt, 'Driver')} className="p-1 text-text-secondary hover:text-taxi-500"><Edit2 size={14} /></button>
                          <button onClick={() => toggleOptionStatus(opt.id, 'Driver')} className="p-1 text-text-secondary hover:text-emerald-500"><Sliders size={14} /></button>
                          <button onClick={() => handleDeleteOption(opt.id, 'Driver')} className="p-1 text-signal-red hover:text-red-700"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Menu Builder Tab --- */}
        {activeTab === 'Menu Builder' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Visual Flow Tree</h3>
              <div className="space-y-3 font-semibold text-xs mt-2 pl-2">
                <div className="flex items-center gap-2 text-taxi-500">
                  <Phone size={14} /> <span>Driver IVR Menu Root</span>
                </div>
                <div className="border-l-2 border-border-strong ml-1.5 pl-4 space-y-3 py-1">
                  {driverOptions.map(opt => (
                    <div key={opt.id} className="flex items-center gap-2 text-text-primary bg-surface/50 p-2 rounded border border-border-subtle">
                      <span className="font-bold text-taxi-500">{opt.key}.</span>
                      <span>{opt.name}</span>
                      <span className="text-[10px] text-text-muted italic ml-auto">{opt.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Drag & Reorder Visual Options</h3>
              <p className="text-xs text-text-muted mb-4">Rearrange routing priority order of key digits below.</p>
              <div className="space-y-2">
                {driverOptions.map((opt, index) => (
                  <div key={opt.id} className="flex items-center justify-between bg-surface p-2.5 rounded-lg border border-border-subtle text-xs">
                    <span className="font-bold text-text-primary">☰ {opt.key} - {opt.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleReorder(index, 'up', 'Driver')} className="p-1 hover:bg-surface-hover rounded text-text-secondary"><ArrowUp size={14} /></button>
                      <button onClick={() => handleReorder(index, 'down', 'Driver')} className="p-1 hover:bg-surface-hover rounded text-text-secondary"><ArrowDown size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Voice Prompts Tab --- */}
        {activeTab === 'Voice Prompts' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <div>
                <h3 className="text-base font-bold text-text-primary">Source Voice Prompts</h3>
                <p className="text-xs text-text-muted mt-0.5">Manage audio greetings and dynamic text-to-speech recordings without code edits.</p>
              </div>
              <Button size="sm" icon={Plus} onClick={() => setShowAddPromptModal(true)}>Create Prompt</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Prompt Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Version</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-xs">
                  {voicePrompts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-text-primary">{p.name}</td>
                      <td className="py-3 px-3">{p.type}</td>
                      <td className="py-3 px-3 font-semibold text-taxi-500">{p.version}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={p.status.toLowerCase()} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="xs" variant="secondary" icon={Play} className="px-2 py-0.5">Preview</Button>
                          <Button size="xs" variant="secondary" icon={Edit2} className="px-2 py-0.5" onClick={() => {
                            setVersionPromptName(p.name)
                            setShowVersionModal(true)
                          }}>Versions</Button>
                          <Button size="xs" variant="danger" className="px-2 py-0.5" onClick={() => {
                            setVoicePrompts(prev => prev.map((item, i) => i === idx ? { ...item, status: item.status === 'Active' ? 'Disabled' : 'Active' } : item))
                          }}>{p.status === 'Active' ? 'Disable' : 'Enable'}</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- IVR Preview / Simulator Tab --- */}
        {activeTab === 'IVR Preview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">IVR Preview & Flow Simulator</h3>
              <p className="text-xs text-text-muted mb-4">Click "Start Preview" to test incoming call flows and push phone pad digits.</p>
              
              <div className="flex gap-3 mb-4">
                <Button size="sm" icon={Play} onClick={startSimulator}>Start Preview</Button>
                <Button size="sm" variant="secondary" icon={RefreshCw} onClick={() => {
                  setSimStep('idle')
                  setSimTextLog([])
                }}>Restart</Button>
              </div>

              {/* Simulated Mobile dialer pad */}
              <div className="bg-surface rounded-2xl p-4 border border-border-subtle max-w-[280px] mx-auto space-y-4">
                <div className="text-center font-bold text-xs border-b border-border-subtle pb-2">
                  <p className="text-text-muted">Simulated Handset Keypad</p>
                  <p className="text-taxi-500 text-lg tracking-widest mt-1">{simDigit || '-'}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm font-bold">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleTriggerSimulateDigit(digit)}
                      disabled={simStep !== 'main_menu'}
                      className="p-3 bg-background hover:bg-surface-hover rounded-xl border border-border-subtle active:bg-taxi-500/20 disabled:opacity-50 transition-all text-text-primary"
                    >
                      {digit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-4 flex flex-col">
              <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Simulator Console Logs</h3>
              <div className="flex-1 bg-background border border-border-subtle rounded-xl p-4 min-h-[300px] overflow-y-auto space-y-3 font-mono text-xs">
                {simTextLog.map((log, idx) => (
                  <div key={idx} className={`p-2 rounded-lg ${log.sender === 'user' ? 'bg-taxi-500/10 border border-taxi-500/20 text-right' : 'bg-surface border border-border-subtle'}`}>
                    <span className="text-[10px] text-text-muted uppercase block font-bold mb-1">{log.sender}</span>
                    <span className="text-text-primary">{log.text}</span>
                  </div>
                ))}
                {simTextLog.length === 0 && (
                  <p className="text-text-muted text-center pt-24 italic">Waiting to start simulation...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- Call History Tab --- */}
        {activeTab === 'Call History' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <h3 className="text-base font-bold text-text-primary">IVR Call Log History</h3>
            </div>

            {/* Filters header */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Search callers..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                icon={Search}
              />
              <Select
                value={historyTypeFilter}
                onChange={(e) => setHistoryTypeFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Callers' },
                  { value: 'Driver', label: 'Driver Callers' },
                  { value: 'Customer', label: 'Customer Callers' }
                ]}
              />
              <Select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'Success', label: 'Success Only' },
                  { value: 'Failed', label: 'Failed Only' }
                ]}
              />
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Caller Number</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Active Menu</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-xs">
                  {filteredHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-medium">{item.date}</td>
                      <td className="py-3 px-3 font-semibold text-text-primary">{item.caller}</td>
                      <td className="py-3 px-3">{item.type}</td>
                      <td className="py-3 px-3 text-text-secondary">{item.menu}</td>
                      <td className="py-3 px-3 font-mono">{item.duration}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${
                          item.status === 'Success' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' : 'bg-red-500/10 text-signal-red ring-red-500/20'
                        }`}>
                          {item.status === 'Success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-text-muted">No call records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* --- Add / Edit IVR Option Modal --- */}
      <Modal
        open={showAddOptionModal}
        onClose={() => setShowAddOptionModal(false)}
        title={editingOption ? "Edit IVR Menu Option" : "Add IVR Menu Option"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddOptionModal(false)}>Cancel</Button>
            <Button onClick={handleSaveOption}>Save Option</Button>
          </>
        }
      >
        <form className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="IVR Type" 
              value={targetIvrType} 
              onChange={(e) => setTargetIvrType(e.target.value)}
              options={[
                { value: 'Driver', label: 'Driver' },
                { value: 'Customer', label: 'Customer' }
              ]}
            />
            <Select 
              label="Digit Key (0-9)" 
              value={optionForm.key} 
              onChange={(e) => setOptionForm(prev => ({ ...prev, key: e.target.value }))}
              options={Array.from({ length: 10 }, (_, i) => ({ value: i.toString(), label: i.toString() }))}
            />
          </div>
          
          <Input 
            label="Option Name" 
            value={optionForm.name} 
            onChange={(e) => setOptionForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Available Trips"
          />

          <Select 
            label="Action trigger" 
            value={optionForm.action} 
            onChange={(e) => setOptionForm(prev => ({ ...prev, action: e.target.value }))}
            options={[
              { value: 'Get Available Trips', label: 'Get Available Trips' },
              { value: 'Accept Trip', label: 'Accept Trip' },
              { value: 'Reject Trip', label: 'Reject Trip' },
              { value: 'Current Trip', label: 'Current Trip' },
              { value: 'Mark Arrived', label: 'Mark Arrived' },
              { value: 'Start Trip', label: 'Start Trip' },
              { value: 'Complete Trip', label: 'Complete Trip' },
              { value: 'Get Earnings', label: 'Get Earnings' },
              { value: 'Transfer to Dispatcher', label: 'Transfer to Dispatcher' },
              { value: 'Play Information', label: 'Play Information' },
              { value: 'Transfer to Support', label: 'Transfer to Support' }
            ]}
          />

          <Select 
            label="Voice Prompt Audio" 
            value={optionForm.prompt} 
            onChange={(e) => setOptionForm(prev => ({ ...prev, prompt: e.target.value }))}
            options={[
              { value: 'Select Prompt', label: 'Select Prompt' },
              { value: 'welcome_v3.mp3', label: 'welcome_v3.mp3' },
              { value: 'driver_avail_trips_v2.mp3', label: 'driver_avail_trips_v2.mp3' },
              { value: 'customer_book_ride_v3.mp3', label: 'customer_book_ride_v3.mp3' }
            ]}
          />

          <Select 
            label="Status" 
            value={optionForm.status} 
            onChange={(e) => setOptionForm(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Disabled', label: 'Disabled' }
            ]}
          />
        </form>
      </Modal>

      {/* --- Add Voice Prompt Modal --- */}
      <Modal
        open={showAddPromptModal}
        onClose={() => setShowAddPromptModal(false)}
        title="Create Voice Prompt"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddPromptModal(false)}>Cancel</Button>
            <Button onClick={handleSaveVoicePrompt}>Save Prompt</Button>
          </>
        }
      >
        <form className="space-y-4 text-xs pr-1 max-h-[70vh] overflow-y-auto">
          <Input
            label="Prompt Name *"
            required
            value={promptForm.name}
            onChange={(e) => setPromptForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Driver Welcome"
          />

          <div>
            <span className="text-xs font-bold text-text-secondary block mb-1">Creation Method</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="method" 
                  checked={promptForm.method === 'upload'}
                  onChange={() => setPromptForm(prev => ({ ...prev, method: 'upload' }))}
                  className="text-taxi-500 focus:ring-taxi-500"
                />
                Upload Audio
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="method" 
                  checked={promptForm.method === 'record'}
                  onChange={() => setPromptForm(prev => ({ ...prev, method: 'record' }))}
                  className="text-taxi-500 focus:ring-taxi-500"
                />
                Record Audio
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input 
                  type="radio" 
                  name="method" 
                  checked={promptForm.method === 'tts'}
                  onChange={() => setPromptForm(prev => ({ ...prev, method: 'tts' }))}
                  className="text-taxi-500 focus:ring-taxi-500"
                />
                Text-to-Speech
              </label>
            </div>
          </div>

          {promptForm.method === 'upload' && (
            <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2">
              <span className="text-[10px] font-bold text-text-muted block uppercase">Upload Audio</span>
              <input type="file" className="text-xs text-text-secondary mt-1" />
              <p className="text-[10px] text-text-muted">Supported: MP3 / WAV formats.</p>
            </div>
          )}

          {promptForm.method === 'record' && (
            <div className="bg-surface p-4 rounded-xl border border-border-subtle text-center space-y-3">
              <span className="text-[10px] font-bold text-text-muted block uppercase">Record Live Audio</span>
              <div className="flex justify-center items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-signal-red">
                  <Mic size={16} />
                </div>
                <span className="font-mono text-sm font-bold text-text-primary">
                  {recordingStatus === 'recording' ? '00:12 Recording...' : '00:00'}
                </span>
              </div>
              <div className="flex justify-center gap-2 mt-1">
                <Button size="xs" onClick={() => setRecordingStatus('recording')}>Start</Button>
                <Button size="xs" variant="secondary" onClick={() => setRecordingStatus('finished')}>Stop</Button>
                <Button size="xs" variant="secondary" disabled={recordingStatus !== 'finished'}>Play Preview</Button>
              </div>
            </div>
          )}

          {promptForm.method === 'tts' && (
            <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-3">
              <span className="text-[10px] font-bold text-text-muted block uppercase">Text-to-Speech Configuration</span>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Select
                  label="Language"
                  value={promptForm.language}
                  onChange={(e) => setPromptForm(prev => ({ ...prev, language: e.target.value }))}
                  options={[{ value: 'English', label: 'English' }, { value: 'Spanish', label: 'Spanish' }]}
                />
                <Select
                  label="Voice Profile"
                  value={promptForm.voice}
                  onChange={(e) => setPromptForm(prev => ({ ...prev, voice: e.target.value }))}
                  options={[{ value: 'Female', label: 'Female' }, { value: 'Male', label: 'Male' }]}
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-secondary block mb-1">TTS Speech Text *</span>
                <textarea
                  className="w-full bg-background border border-border-subtle p-2.5 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-taxi-500 outline-none text-text-primary"
                  rows="3"
                  value={promptForm.text}
                  onChange={(e) => setPromptForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder='e.g. "Welcome to driver portal. Press 1 to check available trips."'
                />
              </div>
              <Button size="xs" variant="secondary" onClick={() => setTtsGenerated(true)}>Generate TTS Preview</Button>
              {ttsGenerated && (
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                  <CheckCircle size={12} /> Audio synthesized successfully.
                </div>
              )}
            </div>
          )}
        </form>
      </Modal>

      {/* --- Prompt version history modal --- */}
      <Modal
        open={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        title={`Prompt Versions: ${versionPromptName}`}
        footer={<Button variant="secondary" onClick={() => setShowVersionModal(false)}>Close</Button>}
      >
        <div className="space-y-4 text-xs pr-1">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Author</th>
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
                      <Button size="xs" variant="secondary" className="px-1.5 py-0.5 text-[10px]">Preview</Button>
                      {v.status !== 'Current' && (
                        <Button size="xs" onClick={() => {
                          setRestoreTargetVersion(v.version)
                          setShowRestoreConfirm(true)
                        }} className="px-1.5 py-0.5 text-[10px]">Restore</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* --- Confirm restore version dialog --- */}
      <Modal
        open={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        title={`Restore Version ${restoreTargetVersion}?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRestoreConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => {
              setShowRestoreConfirm(false)
              setShowVersionModal(false)
            }}>Restore</Button>
          </>
        }
      >
        <div className="p-3 text-xs space-y-2">
          <div className="bg-red-500/10 border border-red-500/20 text-signal-red p-3 rounded-lg flex items-start gap-2">
            <Info size={16} />
            <span>The current active prompt version will be deactivated and replaced with version {restoreTargetVersion}.</span>
          </div>
        </div>
      </Modal>

    </PageLayout>
  )
}
