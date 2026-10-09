import { Edit2, Copy, ToggleRight, ToggleLeft, History, Plus } from 'lucide-react'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Select from '@/shared/components/Select'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'

export default function FareRulesTab({
  companyFilter,
  setCompanyFilter,
  vehicleFilter,
  setVehicleFilter,
  statusFilter,
  setStatusFilter,
  filteredRules,
  handleOpenCreate,
  handleOpenEdit,
  handleDuplicate,
  toggleRuleStatus,
  setActiveTab,
  showCreateModal,
  setShowCreateModal,
  isEditing,
  ruleForm,
  setRuleForm,
  handleSaveRule,
}) {
  return (
    <div className="space-y-6">
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-sm">
          <span className="text-xs text-text-muted">Active Pricing Rules</span>
          <p className="text-2xl font-black text-text-primary mt-1">24</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-sm">
          <span className="text-xs text-text-muted">Service Zones</span>
          <p className="text-2xl font-black text-taxi-500 mt-1">18</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-sm">
          <span className="text-xs text-amber-500 font-semibold">Peak Hour Rules</span>
          <p className="text-2xl font-black text-amber-500 mt-1">8</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-sm">
          <span className="text-xs text-text-muted">Scheduled Rules</span>
          <p className="text-2xl font-black text-text-primary mt-1">6</p>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider font-mono">Filters:</span>
          <div className="w-40">
            <Select
              value={companyFilter}
              onChange={e => setCompanyFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Companies' },
                { value: 'ABC Taxi', label: 'ABC Taxi' },
                { value: 'XYZ Cabs', label: 'XYZ Cabs' }
              ]}
            />
          </div>
          <div className="w-36">
            <Select
              value={vehicleFilter}
              onChange={e => setVehicleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Vehicles' },
                { value: 'Sedan', label: 'Sedan' },
                { value: 'SUV', label: 'SUV' }
              ]}
            />
          </div>
          <div className="w-32">
            <Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
          </div>
        </div>
        <Button size="sm" icon={Plus} onClick={handleOpenCreate}>Create Pricing Rule</Button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl p-6 border border-border-subtle shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Rule Name</th>
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Pricing Type</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Updated</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-text-primary">{rule.name}</td>
                  <td className="py-3.5 px-3 text-text-secondary">{rule.company}</td>
                  <td className="py-3.5 px-3 font-semibold text-text-primary">{rule.vehicle}</td>
                  <td className="py-3.5 px-3">{rule.type}</td>
                  <td className="py-3.5 px-3"><StatusBadge status={rule.status} /></td>
                  <td className="py-3.5 px-3 text-text-muted">{rule.updated}</td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex gap-1 items-center justify-end">
                      <button
                        onClick={() => handleOpenEdit(rule)}
                        title="Edit"
                        className="p-1 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(rule)}
                        title="Duplicate"
                        className="p-1 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => toggleRuleStatus(rule.id)}
                        title={rule.status === 'active' ? 'Deactivate Rule' : 'Activate Rule'}
                        className={`p-1 rounded transition-colors ${
                          rule.status === 'active' 
                            ? 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-500/10' 
                            : 'text-text-secondary hover:text-taxi-500 hover:bg-surface-hover'
                        }`}
                      >
                        {rule.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        onClick={() => setActiveTab('Version History')}
                        title="History"
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

      {/* Create / Edit Rule Overlay Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={isEditing ? 'Modify Fare Rule' : 'Create Pricing Rule'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleSaveRule}>Save Rule</Button>
          </>
        }
      >
        <form className="space-y-4 text-xs pr-1 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Rule Name *"
              required
              value={ruleForm.name}
              onChange={e => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Standard Distance Fare"
            />
            <Select
              label="Company *"
              value={ruleForm.company}
              onChange={e => setRuleForm(prev => ({ ...prev, company: e.target.value }))}
              options={[
                { value: 'ABC Taxi', label: 'ABC Taxi' },
                { value: 'XYZ Cabs', label: 'XYZ Cabs' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Vehicle Fleet *"
              value={ruleForm.vehicle}
              onChange={e => setRuleForm(prev => ({ ...prev, vehicle: e.target.value }))}
              options={[
                { value: 'Sedan', label: 'Sedan' },
                { value: 'SUV', label: 'SUV' },
                { value: 'Van', label: 'Van / MPV' }
              ]}
            />
            <Select
              label="Pricing Formula *"
              value={ruleForm.type}
              onChange={e => setRuleForm(prev => ({ ...prev, type: e.target.value }))}
              options={[
                { value: 'Distance', label: 'Distance-Based' },
                { value: 'Zone', label: 'Zone-to-Zone Flat' },
                { value: 'Time', label: 'Time & Duration' }
              ]}
            />
          </div>

          <div className="border-t border-border-subtle pt-3.5 space-y-3">
            <h4 className="font-bold text-text-primary flex items-center gap-1.5">💵 Core Fare Rates</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Base Ride Fare"
                value={ruleForm.base}
                onChange={e => setRuleForm(prev => ({ ...prev, base: e.target.value }))}
                placeholder="10.00"
              />
              <Input
                label="Minimum Trip Fare"
                value={ruleForm.min}
                onChange={e => setRuleForm(prev => ({ ...prev, min: e.target.value }))}
                placeholder="12.00"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Price per KM / Mile"
                value={ruleForm.perKm}
                onChange={e => setRuleForm(prev => ({ ...prev, perKm: e.target.value }))}
                placeholder="1.50"
              />
              <Input
                label="Price per Minute"
                value={ruleForm.perMin}
                onChange={e => setRuleForm(prev => ({ ...prev, perMin: e.target.value }))}
                placeholder="0.30"
              />
            </div>
          </div>

          <div className="border-t border-border-subtle pt-3.5 space-y-3">
            <h4 className="font-bold text-text-primary flex items-center gap-1.5">⏱️ Wait Time Charges</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Waiting Charge per Minute"
                value={ruleForm.waiting}
                onChange={e => setRuleForm(prev => ({ ...prev, waiting: e.target.value }))}
                placeholder="0.50"
              />
              <Input
                label="Grace Period (minutes)"
                value={ruleForm.grace}
                onChange={e => setRuleForm(prev => ({ ...prev, grace: e.target.value }))}
                placeholder="5"
              />
            </div>
          </div>

          <div className="border-t border-border-subtle pt-3.5 space-y-3">
            <h4 className="font-bold text-text-primary flex items-center gap-1.5">➕ Additional Fees</h4>
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Extra Stop Fee"
                value={ruleForm.extraStop}
                onChange={e => setRuleForm(prev => ({ ...prev, extraStop: e.target.value }))}
                placeholder="5.00"
              />
              <Input
                label="Passenger Fee"
                value={ruleForm.passengerFee}
                onChange={e => setRuleForm(prev => ({ ...prev, passengerFee: e.target.value }))}
                placeholder="0.00"
              />
              <Input
                label="Booking Fee"
                value={ruleForm.bookingFee}
                onChange={e => setRuleForm(prev => ({ ...prev, bookingFee: e.target.value }))}
                placeholder="2.00"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
