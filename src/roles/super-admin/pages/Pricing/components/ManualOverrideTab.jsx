import { AlertTriangle } from 'lucide-react'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'

export default function ManualOverrideTab({
  overrideSearch,
  setOverrideSearch,
  calculatedOverrideFare,
  overrideFare,
  setOverrideFare,
  overrideType,
  setOverrideType,
  overrideReason,
  setOverrideReason,
  overrideLogs,
  handleAddOverride,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Modify Booking Fare</h3>

        <form onSubmit={handleAddOverride} className="space-y-4 text-xs">
          <Input
            label="Booking ID Lookup *"
            required
            value={overrideSearch}
            onChange={e => setOverrideSearch(e.target.value)}
            placeholder="TR-10025"
          />

          <div className="bg-surface p-3 rounded-lg border border-border-subtle space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Calculated Base Fare:</span>
              <span className="font-bold font-mono text-text-primary">${calculatedOverrideFare.toFixed(2)}</span>
            </div>
          </div>

          <Input
            label="Override Fare Value *"
            required
            value={overrideFare}
            onChange={e => setOverrideFare(e.target.value)}
            placeholder="38.00"
          />

          <Select
            label="Override Action Type *"
            value={overrideType}
            onChange={e => setOverrideType(e.target.value)}
            options={[
              { value: 'Discount', label: 'Apply Discount' },
              { value: 'Fixed Override', label: 'Force Fixed Fare' }
            ]}
          />

          <Input
            label="Reason description *"
            required
            value={overrideReason}
            onChange={e => setOverrideReason(e.target.value)}
            placeholder="Customer compensation / delayed dispatch"
          />

          <Button type="submit" className="w-full">Confirm Fare Override</Button>
        </form>
      </div>

      <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Fare Override Audit History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Calculated</th>
                <th className="py-2.5 px-3">Override Fare</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {overrideLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-text-muted">{log.date}</td>
                  <td className="py-3 px-3 font-bold text-taxi-500">{log.bookingId}</td>
                  <td className="py-3 px-3 text-text-secondary font-mono">${log.original.toFixed(2)}</td>
                  <td className="py-3 px-3 text-emerald-600 font-bold font-mono">${log.override.toFixed(2)}</td>
                  <td className="py-3 px-3 font-semibold">{log.type}</td>
                  <td className="py-3 px-3 text-right text-text-secondary italic">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
