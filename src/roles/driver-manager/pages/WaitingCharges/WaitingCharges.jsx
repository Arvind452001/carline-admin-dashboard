import { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Receipt,
  RotateCcw,
  Sliders,
  Info
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import {
  getWaitingChargesPolicy,
  saveWaitingChargesPolicy,
  adjustRideWaitingCharge,
} from '../../services/driverManagerApi'

export default function WaitingCharges() {
  const [activeTab, setActiveTab] = useState('policy') // 'policy' | 'adjust'

  // Policy State
  const [policy, setPolicy] = useState({
    gracePeriodMinutes: 5,
    waitingChargePerMinute: 0.3,
    configured: false,
  })
  const [loadingPolicy, setLoadingPolicy] = useState(true)
  const [policyError, setPolicyError] = useState(null)
  const [policySuccess, setPolicySuccess] = useState(null)
  const [savingPolicy, setSavingPolicy] = useState(false)

  // Form inputs for Policy
  const [gracePeriod, setGracePeriod] = useState(5)
  const [ratePerMinute, setRatePerMinute] = useState(0.3)

  // Adjust Ride State
  const [rideId, setRideId] = useState('')
  const [adjustedCharge, setAdjustedCharge] = useState('')
  const [adjustedMinutes, setAdjustedMinutes] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [submittingAdjust, setSubmittingAdjust] = useState(false)
  const [adjustError, setAdjustError] = useState(null)
  const [adjustSuccess, setAdjustSuccess] = useState(null)
  const [adjustmentLogs, setAdjustmentLogs] = useState([])

  const loadPolicy = useCallback(async () => {
    setLoadingPolicy(true)
    setPolicyError(null)
    setPolicySuccess(null)
    try {
      const data = await getWaitingChargesPolicy()
      setPolicy(data)
      setGracePeriod(data.gracePeriodMinutes)
      setRatePerMinute(data.waitingChargePerMinute)
    } catch (err) {
      setPolicyError(err.message || 'Could not fetch waiting charges policy.')
    } finally {
      setLoadingPolicy(false)
    }
  }, [])

  useEffect(() => {
    loadPolicy()
  }, [loadPolicy])

  async function handleSavePolicy(e) {
    e.preventDefault()
    setPolicyError(null)
    setPolicySuccess(null)

    const grace = Number(gracePeriod)
    const rate = Number(ratePerMinute)

    if (Number.isNaN(grace) || grace < 0) {
      setPolicyError('Grace period must be 0 or more minutes.')
      return
    }
    if (Number.isNaN(rate) || rate < 0) {
      setPolicyError('Waiting charge per minute must be a valid non-negative number.')
      return
    }

    setSavingPolicy(true)
    try {
      await saveWaitingChargesPolicy(
        { gracePeriodMinutes: grace, waitingChargePerMinute: rate },
        policy.configured
      )
      setPolicy({
        gracePeriodMinutes: grace,
        waitingChargePerMinute: rate,
        configured: true,
      })
      setPolicySuccess('Company waiting charges policy saved and activated successfully!')
    } catch (err) {
      setPolicyError(err.message || 'Failed to save waiting charges policy.')
    } finally {
      setSavingPolicy(false)
    }
  }

  async function handleAdjustRide(e) {
    e.preventDefault()
    setAdjustError(null)
    setAdjustSuccess(null)

    const trimmedRideId = rideId.trim()
    if (!trimmedRideId) {
      setAdjustError('Please provide a Ride ID.')
      return
    }

    const chargeVal = Number(adjustedCharge)
    if (Number.isNaN(chargeVal) || chargeVal < 0) {
      setAdjustError('Waiting charge amount must be a number 0 or greater (set 0 to waive).')
      return
    }

    setSubmittingAdjust(true)
    try {
      await adjustRideWaitingCharge(trimmedRideId, {
        waitingCharge: chargeVal,
        waitingMinutes: adjustedMinutes !== '' ? Number(adjustedMinutes) : undefined,
        reason: adjustReason.trim() || undefined,
      })

      const isWaived = chargeVal === 0
      const logEntry = {
        id: trimmedRideId,
        amount: chargeVal,
        minutes: adjustedMinutes,
        reason: adjustReason.trim() || (isWaived ? 'Full Fee Waiver' : 'Adjustment applied'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: isWaived ? 'Waived' : 'Adjusted',
      }

      setAdjustmentLogs((prev) => [logEntry, ...prev])
      setAdjustSuccess(
        isWaived
          ? `Successfully waived waiting charge for Ride #${trimmedRideId}!`
          : `Successfully adjusted waiting charge to $${chargeVal.toFixed(2)} for Ride #${trimmedRideId}!`
      )

      // Reset form
      setRideId('')
      setAdjustedCharge('')
      setAdjustedMinutes('')
      setAdjustReason('')
    } catch (err) {
      setAdjustError(err.message || 'Failed to adjust waiting charge for this ride.')
    } finally {
      setSubmittingAdjust(false)
    }
  }

  function applyQuickWaiver() {
    setAdjustedCharge('0')
    setAdjustReason('Waived by Driver Manager courtesy / flight or traffic delay')
  }

  return (
    <PageLayout
      title="Waiting Charges & Waivers"
      description="Configure company waiting charges policy and adjust or waive waiting charges for specific rides."
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={loadPolicy} disabled={loadingPolicy || savingPolicy}>
            Refresh Policy
          </Button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex border-b border-border-strong mb-6">
        <button
          onClick={() => setActiveTab('policy')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'policy'
              ? 'border-taxi-500 text-taxi-500'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Sliders size={16} />
          Company Policy
        </button>
        <button
          onClick={() => setActiveTab('adjust')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'adjust'
              ? 'border-taxi-500 text-taxi-500'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Receipt size={16} />
          Adjust / Waive Ride Charge
        </button>
      </div>

      {activeTab === 'policy' && (
        <div className="space-y-6">
          {/* Status KPI summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-border-subtle flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-text-muted">Grace Period</p>
                <h3 className="text-2xl font-black text-text-primary mt-1">
                  {policy.gracePeriodMinutes} <span className="text-sm font-semibold text-text-secondary">mins free</span>
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">Complimentary waiting time</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-taxi-500/10 text-taxi-500 flex items-center justify-center">
                <Clock size={24} />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border-subtle flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-text-muted">Waiting Rate</p>
                <h3 className="text-2xl font-black text-text-primary mt-1">
                  ${Number(policy.waitingChargePerMinute).toFixed(2)} <span className="text-sm font-semibold text-text-secondary">/ min</span>
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">Applies after grace period</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <DollarSign size={24} />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-border-subtle flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold text-text-muted">Policy Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                    <ShieldCheck size={13} />
                    {policy.configured ? 'Active Company Policy' : 'Default Policy'}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-1.5">Managed by Driver Manager & Admin</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-signal-purple flex items-center justify-center">
                <Sparkles size={24} />
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl p-6 border border-border-subtle max-w-2xl">
            <h3 className="text-base font-bold text-text-primary mb-1 flex items-center gap-2">
              <Sliders size={18} className="text-taxi-500" />
              Configure Company Waiting Charges Policy
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Updates <code>GET / POST / PUT /api/v1/pricing/waiting-charges</code>. Sets the fleet-wide free grace period and per-minute charge.
            </p>

            {loadingPolicy ? (
              <Loading label="Loading current policy..." />
            ) : (
              <form onSubmit={handleSavePolicy} className="space-y-5">
                {policyError && (
                  <div className="flex items-start gap-2 rounded-xl border border-signal-red/20 bg-signal-red/5 p-3.5 text-xs text-signal-red">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    <span>{policyError}</span>
                  </div>
                )}

                {policySuccess && (
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    <span>{policySuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Free Grace Period (Minutes)
                    </label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={gracePeriod}
                      onChange={(e) => setGracePeriod(e.target.value)}
                      placeholder="e.g. 5"
                      disabled={savingPolicy}
                      icon={Clock}
                    />
                    <p className="text-[11px] text-text-muted mt-1">
                      Minutes passengers can take to board before waiting charges commence.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Waiting Charge Rate ($ per minute)
                    </label>
                    <Input
                      type="number"
                      step="0.05"
                      min="0"
                      value={ratePerMinute}
                      onChange={(e) => setRatePerMinute(e.target.value)}
                      placeholder="e.g. 0.30"
                      disabled={savingPolicy}
                      icon={DollarSign}
                    />
                    <p className="text-[11px] text-text-muted mt-1">
                      Rate charged per minute after grace period expires.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-surface-raised border border-border-subtle p-3.5 flex items-start gap-2.5 text-xs text-text-secondary">
                  <Info size={16} className="text-taxi-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-text-primary">Policy Computation Example:</p>
                    <p className="mt-0.5">
                      With a <strong>{gracePeriod || 0} min</strong> grace period and <strong>${Number(ratePerMinute || 0).toFixed(2)}/min</strong> rate,
                      if a driver waits <strong>15 minutes</strong>, customer will be charged for <strong>{Math.max(0, (Number(gracePeriod) ? 15 - Number(gracePeriod) : 15))} minutes</strong> = <strong>${(Math.max(0, (15 - Number(gracePeriod))) * Number(ratePerMinute || 0)).toFixed(2)}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={savingPolicy}>
                    {savingPolicy ? 'Saving Policy...' : 'Save Policy'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setGracePeriod(policy.gracePeriodMinutes)
                      setRatePerMinute(policy.waitingChargePerMinute)
                    }}
                    disabled={savingPolicy}
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === 'adjust' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Adjustment Form Card */}
            <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-border-subtle">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                  <Receipt size={18} className="text-taxi-500" />
                  Adjust or Waive Ride Waiting Charges
                </h3>
                <span className="text-[10px] font-mono bg-taxi-500/10 text-taxi-600 px-2.5 py-1 rounded-full font-bold">
                  PATCH /api/v1/ride/:id/adjust-waiting-charge
                </span>
              </div>
              <p className="text-xs text-text-muted mb-6">
                Company Admin and Driver Manager can decide, adjust or completely waive waiting charges for any ride.
              </p>

              <form onSubmit={handleAdjustRide} className="space-y-4">
                {adjustError && (
                  <div className="flex items-start gap-2 rounded-xl border border-signal-red/20 bg-signal-red/5 p-3.5 text-xs text-signal-red">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    <span>{adjustError}</span>
                  </div>
                )}

                {adjustSuccess && (
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-600">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    <span>{adjustSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Ride ID / Booking Reference *
                  </label>
                  <Input
                    value={rideId}
                    onChange={(e) => setRideId(e.target.value)}
                    placeholder="Enter Ride ID (e.g. 66e6be12e4b0c2a5d3f88123 or RD-4091)"
                    disabled={submittingAdjust}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Adjusted Waiting Charge ($) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={adjustedCharge}
                      onChange={(e) => setAdjustedCharge(e.target.value)}
                      placeholder="0.00 to waive, or custom $"
                      disabled={submittingAdjust}
                      icon={DollarSign}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                      Adjusted Waiting Minutes (Optional)
                    </label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={adjustedMinutes}
                      onChange={(e) => setAdjustedMinutes(e.target.value)}
                      placeholder="e.g. 5"
                      disabled={submittingAdjust}
                      icon={Clock}
                    />
                  </div>
                </div>

                {/* Quick Action Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-text-muted">Quick Actions:</span>
                  <button
                    type="button"
                    onClick={applyQuickWaiver}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-600 transition-colors"
                  >
                    <Sparkles size={13} />
                    Waive Full Charge ($0.00)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustedCharge('1.50')}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface-hover hover:bg-surface-raised border border-border-subtle px-2 py-1 text-xs font-medium text-text-secondary transition-colors"
                  >
                    Set $1.50
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustedCharge('2.50')}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface-hover hover:bg-surface-raised border border-border-subtle px-2 py-1 text-xs font-medium text-text-secondary transition-colors"
                  >
                    Set $2.50
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Reason for Adjustment / Waiver
                  </label>
                  <Input
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. Adjusted by driver manager due to flight delay, traffic or goodwill"
                    disabled={submittingAdjust}
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Recorded in ride timeline and transaction history.
                  </p>
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={submittingAdjust} className="w-full sm:w-auto">
                    {submittingAdjust ? 'Applying Adjustment...' : 'Apply Waiting Charge Adjustment'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Adjustment Activity & Guideline Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card rounded-2xl p-5 border border-border-subtle">
                <h4 className="text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
                  <RotateCcw size={15} className="text-taxi-500" />
                  Recent Session Adjustments
                </h4>
                {adjustmentLogs.length === 0 ? (
                  <p className="text-xs text-text-muted py-4 text-center">
                    No adjustments made yet in this session.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {adjustmentLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border-subtle bg-surface p-3 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text-primary font-mono">#{log.id}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                log.status === 'Waived'
                                  ? 'bg-emerald-500/15 text-emerald-600'
                                  : 'bg-taxi-500/15 text-taxi-600'
                              }`}
                            >
                              {log.status}: ${log.amount.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5 truncate max-w-[200px]">
                            {log.reason}
                          </p>
                        </div>
                        <span className="text-[10px] text-text-muted shrink-0">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card rounded-2xl p-5 border border-border-subtle text-xs space-y-2">
                <h4 className="font-bold text-text-primary flex items-center gap-1.5">
                  <Info size={14} className="text-taxi-500" />
                  Driver Manager Policy Guidelines
                </h4>
                <ul className="list-disc list-inside space-y-1 text-text-muted text-[11px]">
                  <li>Setting the waiting charge to <code>0</code> completely waives the passenger fee.</li>
                  <li>Adjusted charges immediately reflect on the ride final fare breakdown.</li>
                  <li>Customer service and billing modules automatically inherit these adjustments.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
