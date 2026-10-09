import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import FareRulesTab from './components/FareRulesTab'
import SurchargesTaxesTab from './components/SurchargesTaxesTab'
import TimePricingTab from './components/TimePricingTab'
import ManualOverrideTab from './components/ManualOverrideTab'
import FareSimulatorTab from './components/FareSimulatorTab'
import VersionHistoryTab from './components/VersionHistoryTab'

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('Fare Rules')
  const [rules, setRules] = useState([
    { id: 1, name: 'Standard Fare', company: 'ABC Taxi', vehicle: 'Sedan', type: 'Distance', status: 'active', updated: 'Today', base: 10, min: 12, perKm: 1.5, perMin: 0.3, waiting: 0.5, grace: 5, extraStop: 5, passengerFee: 0, bookingFee: 2 },
    { id: 2, name: 'Airport Fare', company: 'ABC Taxi', vehicle: 'Sedan', type: 'Zone', status: 'active', updated: 'Yesterday', base: 15, min: 20, perKm: 1.8, perMin: 0.4, waiting: 0.6, grace: 10, extraStop: 7, passengerFee: 2, bookingFee: 3 },
    { id: 3, name: 'Night Fare', company: 'XYZ Cabs', vehicle: 'SUV', type: 'Time', status: 'active', updated: 'Aug 15', base: 12, min: 15, perKm: 2.0, perMin: 0.5, waiting: 0.8, grace: 5, extraStop: 10, passengerFee: 0, bookingFee: 2 }
  ])

  // Filters State
  const [companyFilter, setCompanyFilter] = useState('all')
  const [vehicleFilter, setVehicleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Create/Edit Rule Form
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [ruleForm, setRuleForm] = useState({
    id: '',
    name: '',
    company: 'ABC Taxi',
    vehicle: 'Sedan',
    type: 'Distance',
    status: 'active',
    base: '10',
    min: '12',
    perKm: '1.5',
    perMin: '0.3',
    waiting: '0.5',
    grace: '5',
    extraStop: '5',
    passengerFee: '0',
    bookingFee: '2'
  })

  // Surcharges & Taxes
  const [surcharges, setSurcharges] = useState({
    airportSurcharge: '5.00',
    nightSurcharge: '10%',
    weekendSurcharge: '15%',
    holidaySurcharge: '5.00',
    peakHourSurcharge: '2.00',
    taxType: 'GST',
    taxPercent: '5',
    serviceFee: '2.00',
    otherFee: '0.00'
  })

  // Time-Based Rules
  const [timeRules, setTimeRules] = useState([
    {
      name: 'Night Fare Shift',
      days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: true },
      startTime: '22:00',
      endTime: '06:00',
      adjustment: '+20%',
      status: 'active'
    }
  ])
  const [newTimeRule, setNewTimeRule] = useState({
    name: '',
    days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false },
    startTime: '22:00',
    endTime: '06:00',
    adjustmentType: 'Percent',
    adjustmentValue: '20',
    status: 'active'
  })

  // Manual Override Screen States
  const [overrideSearch, setOverrideSearch] = useState('TR-10025')
  const [calculatedOverrideFare, setCalculatedOverrideFare] = useState(42.50)
  const [overrideFare, setOverrideFare] = useState('38.00')
  const [overrideReason, setOverrideReason] = useState('Customer compensation')
  const [overrideType, setOverrideType] = useState('Discount')
  const [overrideLogs, setOverrideLogs] = useState([
    { date: 'Aug 17, 2026', bookingId: 'TR-10025', original: 42.50, override: 38.00, type: 'Discount', reason: 'Customer compensation', author: 'Super Admin' }
  ])

  // Simulator State
  const [simInputs, setSimInputs] = useState({
    vehicle: 'Sedan',
    pickup: 'Airport',
    destination: 'Downtown',
    distance: '12.5',
    duration: '28',
    waiting: '5'
  })
  const [simResult, setSimResult] = useState(null)

  // Version History
  const [versionHistory, setVersionHistory] = useState([
    { version: 'v4', date: 'Aug 17, 2026 12:00 PM', author: 'Super Admin', status: 'Current', description: 'Updated airport distance surcharge tier.' },
    { version: 'v3', date: 'Aug 10, 2026 09:30 AM', author: 'Admin', status: 'Previous', description: 'Added monsoon holiday flat surcharge rules.' },
    { version: 'v2', date: 'Aug 02, 2026 11:15 AM', author: 'Admin', status: 'Previous', description: 'Adjusted base waiting charges time grace limits.' },
    { version: 'v1', date: 'Jul 25, 2026 04:00 PM', author: 'Admin', status: 'Previous', description: 'Initial fare pricing matrices release.' }
  ])

  // --- Functions ---
  const handleOpenCreate = () => {
    setIsEditing(false)
    setRuleForm({
      id: '',
      name: '',
      company: 'ABC Taxi',
      vehicle: 'Sedan',
      type: 'Distance',
      status: 'active',
      base: '10',
      min: '12',
      perKm: '1.5',
      perMin: '0.3',
      waiting: '0.5',
      grace: '5',
      extraStop: '5',
      passengerFee: '0',
      bookingFee: '2'
    })
    setShowCreateModal(true)
  }

  const handleOpenEdit = (rule) => {
    setIsEditing(true)
    setRuleForm({
      id: rule.id,
      name: rule.name,
      company: rule.company,
      vehicle: rule.vehicle,
      type: rule.type,
      status: rule.status,
      base: String(rule.base),
      min: String(rule.min),
      perKm: String(rule.perKm),
      perMin: String(rule.perMin),
      waiting: String(rule.waiting),
      grace: String(rule.grace),
      extraStop: String(rule.extraStop),
      passengerFee: String(rule.passengerFee),
      bookingFee: String(rule.bookingFee)
    })
    setShowCreateModal(true)
  }

  const handleSaveRule = (e) => {
    e.preventDefault()
    if (!ruleForm.name) return

    const item = {
      id: isEditing ? ruleForm.id : rules.length + 1,
      name: ruleForm.name,
      company: ruleForm.company,
      vehicle: ruleForm.vehicle,
      type: ruleForm.type,
      status: ruleForm.status,
      updated: 'Today',
      base: parseFloat(ruleForm.base || 0),
      min: parseFloat(ruleForm.min || 0),
      perKm: parseFloat(ruleForm.perKm || 0),
      perMin: parseFloat(ruleForm.perMin || 0),
      waiting: parseFloat(ruleForm.waiting || 0),
      grace: parseFloat(ruleForm.grace || 0),
      extraStop: parseFloat(ruleForm.extraStop || 0),
      passengerFee: parseFloat(ruleForm.passengerFee || 0),
      bookingFee: parseFloat(ruleForm.bookingFee || 0)
    }

    if (isEditing) {
      setRules(prev => prev.map(r => r.id === item.id ? item : r))
    } else {
      setRules(prev => [item, ...prev])
    }

    // Add to version history
    setVersionHistory(prev => [
      {
        version: `v${prev.length + 1}`,
        date: new Date().toLocaleString(),
        author: 'Super Admin',
        status: 'Current',
        description: `Modified pricing rule: ${item.name}`
      },
      ...prev.map(v => ({ ...v, status: 'Previous' }))
    ])

    setShowCreateModal(false)
  }

  const handleDuplicate = (rule) => {
    const duplicated = {
      ...rule,
      id: rules.length + 1,
      name: `${rule.name} (Copy)`,
      updated: 'Today'
    }
    setRules(prev => [duplicated, ...prev])
  }

  const toggleRuleStatus = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r))
  }

  const handleAddOverride = (e) => {
    e.preventDefault()
    if (!overrideFare || !overrideReason) return

    setOverrideLogs(prev => [
      {
        date: 'Today',
        bookingId: overrideSearch,
        original: calculatedOverrideFare,
        override: parseFloat(overrideFare),
        type: overrideType,
        reason: overrideReason,
        author: 'Super Admin'
      },
      ...prev
    ])

    alert('Override confirmed! This transaction has been recorded in the system audit logs.')
  }

  const handleCalculateSimulation = (e) => {
    e.preventDefault()
    // Perform simple simulation math based on selected vehicle
    const vehicleFactor = simInputs.vehicle === 'SUV' ? 1.5 : simInputs.vehicle === 'Van' ? 1.8 : 1.0
    const base = 10 * vehicleFactor
    const distanceVal = parseFloat(simInputs.distance || 0) * 1.5 * vehicleFactor
    const timeVal = parseFloat(simInputs.duration || 0) * 0.3 * vehicleFactor
    const waitVal = parseFloat(simInputs.waiting || 0) * 0.5 * vehicleFactor
    const surcharge = 5.0
    const tax = (base + distanceVal + timeVal + waitVal + surcharge) * 0.05

    setSimResult({
      base,
      distance: distanceVal,
      time: timeVal,
      waiting: waitVal,
      surcharge,
      tax,
      total: base + distanceVal + timeVal + waitVal + surcharge + tax
    })
  }

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      const matchCompany = companyFilter === 'all' || r.company === companyFilter
      const matchVehicle = vehicleFilter === 'all' || r.vehicle === vehicleFilter
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchCompany && matchVehicle && matchStatus
    })
  }, [rules, companyFilter, vehicleFilter, statusFilter])

  return (
    <PageLayout
      title="Pricing Management"
      description="Configure core fare metrics, tax rates, time-based surges, manual overrides, and simulate calculations."
      actions={
        <div className="flex gap-2">
          <Button icon={Plus} onClick={handleOpenCreate}>
            Create Pricing Rule
          </Button>
        </div>
      }
    >
      {/* Navigation tabs */}
      <div className="flex border-b border-border-strong overflow-x-auto pb-px mb-6 scrollbar-none">
        {['Fare Rules', 'Surcharges & Taxes', 'Time-Based Rules', 'Manual Override', 'Fare Simulator', 'Version History'].map(t => (
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

      {/* Tab Panel Renderers */}
      <div className="space-y-6">
        {activeTab === 'Fare Rules' && (
          <FareRulesTab
            companyFilter={companyFilter}
            setCompanyFilter={setCompanyFilter}
            vehicleFilter={vehicleFilter}
            setVehicleFilter={setVehicleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            filteredRules={filteredRules}
            handleOpenCreate={handleOpenCreate}
            handleOpenEdit={handleOpenEdit}
            handleDuplicate={handleDuplicate}
            toggleRuleStatus={toggleRuleStatus}
            setActiveTab={setActiveTab}
            showCreateModal={showCreateModal}
            setShowCreateModal={setShowCreateModal}
            isEditing={isEditing}
            ruleForm={ruleForm}
            setRuleForm={setRuleForm}
            handleSaveRule={handleSaveRule}
          />
        )}

        {activeTab === 'Surcharges & Taxes' && (
          <SurchargesTaxesTab
            surcharges={surcharges}
            setSurcharges={setSurcharges}
          />
        )}

        {activeTab === 'Time-Based Rules' && (
          <TimePricingTab
            timeRules={timeRules}
            setTimeRules={setTimeRules}
            newTimeRule={newTimeRule}
            setNewTimeRule={setNewTimeRule}
          />
        )}

        {activeTab === 'Manual Override' && (
          <ManualOverrideTab
            overrideSearch={overrideSearch}
            setOverrideSearch={setOverrideSearch}
            calculatedOverrideFare={calculatedOverrideFare}
            setCalculatedOverrideFare={setCalculatedOverrideFare}
            overrideFare={overrideFare}
            setOverrideFare={setOverrideFare}
            overrideType={overrideType}
            setOverrideType={setOverrideType}
            overrideReason={overrideReason}
            setOverrideReason={setOverrideReason}
            overrideLogs={overrideLogs}
            handleAddOverride={handleAddOverride}
          />
        )}

        {activeTab === 'Fare Simulator' && (
          <FareSimulatorTab
            simInputs={simInputs}
            setSimInputs={setSimInputs}
            simResult={simResult}
            handleCalculateSimulation={handleCalculateSimulation}
          />
        )}

        {activeTab === 'Version History' && (
          <VersionHistoryTab
            versionHistory={versionHistory}
            setVersionHistory={setVersionHistory}
          />
        )}
      </div>
    </PageLayout>
  )
}
