import { useCallback, useEffect, useMemo, useState } from 'react'
import { Clock, Coins, Loader2, Pencil, Plus, RefreshCw, Save, Trash2 } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Table from '@/shared/components/Table'
import Badge from '@/shared/components/Badge'
import StatusBadge from '@/shared/components/StatusBadge'
import Modal from '@/shared/components/Modal'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import { useAuthStore } from '@/store/authStore'
import { currency } from '@/shared/utils/currency'
import { companyIdFromUser } from '@/roles/company-admin/services/dashboardApi'
import {
  ZONE_STATUS_OPTIONS,
  createFareRules,
  createWaitingCharges,
  createZoneRule,
  deleteZoneRule,
  loadPricingSettings,
  updateFareRules,
  updateWaitingCharges,
  updateZoneRule,
} from '@/roles/company-admin/services/pricingApi'

const EMPTY_FARE_RULES = { baseFare: '', minimumFare: '', perKmRate: '', perMinuteRate: '' }
const EMPTY_WAITING_CHARGES = { gracePeriodMinutes: '', waitingChargePerMinute: '' }
const EMPTY_ZONE_RULE = { id: '', zoneName: '', baseFareSurcharge: '', multiplier: '1', status: 'Active' }

const TABS = ['Fare Rules', 'Zone Pricing', 'Waiting Charges']

// Inputs hold text so a half-typed number stays editable; the service coerces
// each field to a number when the request is built.
const asText = (value) => (value === undefined || value === null || value === '' ? '' : String(value))

const fareRulesToForm = (values) => ({
  baseFare: asText(values.baseFare),
  minimumFare: asText(values.minimumFare),
  perKmRate: asText(values.perKmRate),
  perMinuteRate: asText(values.perMinuteRate),
})

const waitingChargesToForm = (values) => ({
  gracePeriodMinutes: asText(values.gracePeriodMinutes),
  waitingChargePerMinute: asText(values.waitingChargePerMinute),
})

const zoneRuleToForm = (rule) => ({
  id: rule.id,
  zoneName: rule.zoneName,
  baseFareSurcharge: asText(rule.baseFareSurcharge),
  multiplier: asText(rule.multiplier),
  status: rule.status,
})

export default function Pricing() {
  const user = useAuthStore((state) => state.user)
  const companyId = useMemo(() => companyIdFromUser(user), [user])

  const [activeTab, setActiveTab] = useState(TABS[0])
  const [fareRules, setFareRules] = useState(EMPTY_FARE_RULES)
  const [fareConfigured, setFareConfigured] = useState(false)
  const [waitingCharges, setWaitingCharges] = useState(EMPTY_WAITING_CHARGES)
  const [waitingConfigured, setWaitingConfigured] = useState(false)
  const [zoneRules, setZoneRules] = useState([])

  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)
  const [error, setError] = useState(null)
  // Marks the row or form whose request is in flight so only that control locks.
  const [pending, setPending] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState(null)
  const [zoneModal, setZoneModal] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  // Saves refresh in the background so the forms never flash back to a spinner.
  const load = useCallback(
    async ({ background = false } = {}) => {
      if (background) setReloading(true)
      else setLoading(true)
      setError(null)
      try {
        const settings = await loadPricingSettings(companyId)
        setFareRules(fareRulesToForm(settings.fareRules.values))
        setFareConfigured(settings.fareRules.configured)
        setWaitingCharges(waitingChargesToForm(settings.waitingCharges.values))
        setWaitingConfigured(settings.waitingCharges.configured)
        setZoneRules(settings.zoneRules)
      } catch (err) {
        setError(err.message || 'Could not load the pricing engine.')
      } finally {
        if (background) setReloading(false)
        else setLoading(false)
      }
    },
    [companyId]
  )

  useEffect(() => {
    load()
  }, [load])

  function clearMessages() {
    setNotice('')
    setActionError(null)
  }

  function setZoneField(key, value) {
    setZoneModal((prev) => (prev ? { ...prev, values: { ...prev.values, [key]: value } } : prev))
  }

  async function handleSaveFareRules() {
    clearMessages()
    setPending('fare')
    try {
      // A company with no saved pricing is created, not updated.
      if (fareConfigured) await updateFareRules(fareRules, companyId)
      else await createFareRules(fareRules, companyId)
      setNotice(fareConfigured ? 'Fare rules saved.' : 'Fare rules created.')
      await load({ background: true })
    } catch (err) {
      setActionError(err.message || 'Could not save the fare rules.')
    } finally {
      setPending('')
    }
  }

  async function handleSaveWaitingCharges() {
    clearMessages()
    setPending('waiting')
    try {
      if (waitingConfigured) await updateWaitingCharges(waitingCharges, companyId)
      else await createWaitingCharges(waitingCharges, companyId)
      setNotice(waitingConfigured ? 'Waiting charges saved.' : 'Waiting charges created.')
      await load({ background: true })
    } catch (err) {
      setActionError(err.message || 'Could not save the waiting charges.')
    } finally {
      setPending('')
    }
  }

  async function handleSaveZoneRule() {
    const current = zoneModal
    if (!current) return
    clearMessages()
    setPending('zone')
    try {
      if (current.mode === 'edit') await updateZoneRule(current.values, companyId)
      else await createZoneRule(current.values, companyId)
      setNotice(current.mode === 'edit' ? 'Zone rule saved.' : 'Zone rule created.')
      setZoneModal(null)
      await load({ background: true })
    } catch (err) {
      setActionError(err.message || 'Could not save the zone rule.')
    } finally {
      setPending('')
    }
  }

  async function handleDeleteZoneRule() {
    const target = pendingDelete
    if (!target) return
    clearMessages()
    setPending('zone')
    try {
      await deleteZoneRule(target.id, companyId)
      setPendingDelete(null)
      setNotice(`${target.zoneName} was deleted.`)
      await load({ background: true })
    } catch (err) {
      setActionError(err.message || 'Could not delete the zone rule.')
    } finally {
      setPending('')
    }
  }

  const busy = pending !== ''

  return (
    <PageLayout
      title="Pricing Engine"
      description="Manage base fares, zone structures and wait-time billing for your company."
      actions={
        <Button
          variant="secondary"
          icon={RefreshCw}
          onClick={() => load({ background: true })}
          disabled={loading || reloading}
        >
          Refresh
        </Button>
      }
    >
      <div className="mb-6 flex overflow-x-auto border-b border-border-strong pb-px">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'border-taxi-500 text-taxi-500'
                : 'border-transparent text-text-secondary hover:border-border-subtle hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {notice && (
        <div className="mb-4 rounded-xl border border-signal-green/25 bg-signal-green/10 px-3.5 py-2 text-xs text-signal-green">
          {notice}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-xl border border-signal-red/30 bg-signal-red/10 px-3.5 py-2 text-xs text-signal-red">
          {actionError}
        </div>
      )}

      {loading ? (
        <Loading label="Loading pricing engine..." />
      ) : error ? (
        <ErrorState title="Could not load the pricing engine" description={error} onRetry={() => load()} />
      ) : (
        <div className="max-w-4xl space-y-6">
          {activeTab === 'Fare Rules' && (
            <div className="glass-card space-y-4 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-2">
                <h3 className="text-sm font-bold text-text-primary">Base Fare & Distance Rates</h3>
                <Badge tone={fareConfigured ? 'green' : 'amber'}>
                  {fareConfigured ? 'Configured' : 'Not configured'}
                </Badge>
              </div>

              {!fareConfigured && (
                <p className="rounded-xl border border-taxi-500/30 bg-taxi-500/10 px-3.5 py-2 text-xs text-taxi-500">
                  No pricing has been saved for this company yet. Saving creates the fare rule set.
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Base Fare *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={fareRules.baseFare}
                  onChange={(e) => setFareRules((prev) => ({ ...prev, baseFare: e.target.value }))}
                  icon={Coins}
                />
                <Input
                  label="Minimum Fare *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={fareRules.minimumFare}
                  onChange={(e) => setFareRules((prev) => ({ ...prev, minimumFare: e.target.value }))}
                  icon={Coins}
                />
                <Input
                  label="Per Kilometer Rate *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={fareRules.perKmRate}
                  onChange={(e) => setFareRules((prev) => ({ ...prev, perKmRate: e.target.value }))}
                  icon={Coins}
                />
                <Input
                  label="Per Minute (Time) Rate *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={fareRules.perMinuteRate}
                  onChange={(e) => setFareRules((prev) => ({ ...prev, perMinuteRate: e.target.value }))}
                  icon={Coins}
                />
              </div>

              <Button
                icon={pending === 'fare' ? Loader2 : Save}
                onClick={handleSaveFareRules}
                disabled={pending === 'fare'}
              >
                {pending === 'fare' ? 'Saving...' : fareConfigured ? 'Save fare rules' : 'Create fare rules'}
              </Button>
            </div>
          )}

          {activeTab === 'Zone Pricing' && (
            <div className="glass-card space-y-4 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-2">
                <h3 className="text-sm font-bold text-text-primary">Zone-Specific Fares</h3>
                <Button
                  icon={Plus}
                  size="sm"
                  disabled={busy}
                  onClick={() => setZoneModal({ mode: 'create', values: { ...EMPTY_ZONE_RULE } })}
                >
                  Add zone rule
                </Button>
              </div>

              <Table
                columns={[
                  { key: 'zoneName', label: 'Zone' },
                  {
                    key: 'baseFareSurcharge',
                    label: 'Base Fare Surcharge',
                    render: (row) => currency(row.baseFareSurcharge),
                  },
                  { key: 'multiplier', label: 'Multiplier', render: (row) => `${row.multiplier}x` },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (row) => <StatusBadge status={row.status.toLowerCase()} />,
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (row) => (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Pencil}
                          disabled={busy}
                          onClick={() => setZoneModal({ mode: 'edit', values: zoneRuleToForm(row) })}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          icon={Trash2}
                          disabled={busy}
                          onClick={() => setPendingDelete(row)}
                        >
                          Delete
                        </Button>
                      </div>
                    ),
                  },
                ]}
                rows={zoneRules}
                emptyLabel="No zone rules yet - add your first zone"
              />
            </div>
          )}

          {activeTab === 'Waiting Charges' && (
            <div className="glass-card space-y-4 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-2">
                <h3 className="text-sm font-bold text-text-primary">Wait-Time Billing</h3>
                <Badge tone={waitingConfigured ? 'green' : 'amber'}>
                  {waitingConfigured ? 'Configured' : 'Not configured'}
                </Badge>
              </div>

              {!waitingConfigured && (
                <p className="rounded-xl border border-taxi-500/30 bg-taxi-500/10 px-3.5 py-2 text-xs text-taxi-500">
                  Waiting charges have not been saved for this company yet. Saving creates them.
                </p>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Grace Period before waiting starts (Minutes) *"
                  type="number"
                  step="1"
                  min="0"
                  value={waitingCharges.gracePeriodMinutes}
                  onChange={(e) => setWaitingCharges((prev) => ({ ...prev, gracePeriodMinutes: e.target.value }))}
                  icon={Clock}
                />
                <Input
                  label="Waiting Charge Per Minute *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={waitingCharges.waitingChargePerMinute}
                  onChange={(e) => setWaitingCharges((prev) => ({ ...prev, waitingChargePerMinute: e.target.value }))}
                  icon={Coins}
                />
              </div>

              <Button
                icon={pending === 'waiting' ? Loader2 : Save}
                onClick={handleSaveWaitingCharges}
                disabled={pending === 'waiting'}
              >
                {pending === 'waiting'
                  ? 'Saving...'
                  : waitingConfigured
                    ? 'Save waiting charges'
                    : 'Create waiting charges'}
              </Button>
            </div>
          )}
        </div>
      )}

      <Modal
        open={Boolean(zoneModal)}
        onClose={() => setZoneModal(null)}
        title={zoneModal?.mode === 'edit' ? 'Edit zone rule' : 'Add zone rule'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setZoneModal(null)}>
              Cancel
            </Button>
            <Button
              icon={pending === 'zone' ? Loader2 : Save}
              onClick={handleSaveZoneRule}
              disabled={pending === 'zone'}
            >
              {pending === 'zone' ? 'Saving...' : zoneModal?.mode === 'edit' ? 'Save changes' : 'Create zone rule'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Zone name *"
            placeholder="Indore Airport Zone"
            value={zoneModal?.values.zoneName ?? ''}
            onChange={(e) => setZoneField('zoneName', e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Base Fare Surcharge *"
              type="number"
              step="0.01"
              min="0"
              value={zoneModal?.values.baseFareSurcharge ?? ''}
              onChange={(e) => setZoneField('baseFareSurcharge', e.target.value)}
              icon={Coins}
            />
            <Input
              label="Multiplier *"
              type="number"
              step="0.1"
              min="0"
              value={zoneModal?.values.multiplier ?? ''}
              onChange={(e) => setZoneField('multiplier', e.target.value)}
            />
          </div>
          <Select
            label="Status"
            options={ZONE_STATUS_OPTIONS}
            value={zoneModal?.values.status ?? 'Active'}
            onChange={(e) => setZoneField('status', e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete zone rule"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={pending === 'zone' ? Loader2 : Trash2}
              onClick={handleDeleteZoneRule}
              disabled={pending === 'zone'}
            >
              {pending === 'zone' ? 'Deleting...' : 'Delete zone rule'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-secondary">
          Delete <span className="font-semibold text-text-primary">{pendingDelete?.zoneName}</span>?
        </p>
        <p className="mt-2 text-xs text-text-muted">
          Fares for trips in this zone will fall back to the base fare rules. This cannot be undone.
        </p>
      </Modal>
    </PageLayout>
  )
}
