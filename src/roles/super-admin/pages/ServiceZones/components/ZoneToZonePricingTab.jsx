import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'

export default function ZoneToZonePricingTab({
  z2zRules,
  setZ2zRules,
  newZ2z,
  setNewZ2z,
  zones,
  handleAddZ2z,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Zone Fare Adjustments Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">From Zone</th>
                <th className="py-2.5 px-3">To Zone</th>
                <th className="py-2.5 px-3">Sedan Rate</th>
                <th className="py-2.5 px-3">SUV Rate</th>
                <th className="py-2.5 px-3 text-right">Zone Surcharge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {z2zRules.map((r, idx) => (
                <tr key={idx} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-text-primary">{r.from}</td>
                  <td className="py-3 px-3 font-semibold text-text-primary">{r.to}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600">${r.sedan}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600">${r.suv}</td>
                  <td className="py-3 px-3 text-right text-text-secondary font-mono">${r.surcharge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Configure Flat Zone Route</h3>
        <form onSubmit={handleAddZ2z} className="space-y-3.5 text-xs">
          <Select
            label="From Zone"
            value={newZ2z.from}
            onChange={e => setNewZ2z(prev => ({ ...prev, from: e.target.value }))}
            options={zones.map(z => ({ value: z.name, label: z.name }))}
          />
          <Select
            label="To Zone"
            value={newZ2z.to}
            onChange={e => setNewZ2z(prev => ({ ...prev, to: e.target.value }))}
            options={zones.map(z => ({ value: z.name, label: z.name }))}
          />
          <Select
            label="Vehicle Class"
            value={newZ2z.vehicle}
            onChange={e => setNewZ2z(prev => ({ ...prev, vehicle: e.target.value }))}
            options={[
              { value: 'Sedan', label: 'Sedan' },
              { value: 'SUV', label: 'SUV' }
            ]}
          />
          <Input
            label="Base Segment Fare"
            value={newZ2z.baseFare}
            onChange={e => setNewZ2z(prev => ({ ...prev, baseFare: e.target.value }))}
            placeholder="10.00"
          />
          <Input
            label="Distance Estimator Rate"
            value={newZ2z.distanceFare}
            onChange={e => setNewZ2z(prev => ({ ...prev, distanceFare: e.target.value }))}
            placeholder="15.00"
          />
          <Input
            label="Zone Boundary Surcharge"
            value={newZ2z.zoneSurcharge}
            onChange={e => setNewZ2z(prev => ({ ...prev, zoneSurcharge: e.target.value }))}
            placeholder="5.00"
          />
          <div className="border-t border-border-subtle pt-3 flex justify-between items-center text-xs">
            <div>
              <span className="text-text-muted text-[11px] block">Calculated Total:</span>
              <span className="font-black text-emerald-600 block text-sm">
                ${(parseFloat(newZ2z.baseFare || 0) + parseFloat(newZ2z.distanceFare || 0) + parseFloat(newZ2z.zoneSurcharge || 0)).toFixed(2)}
              </span>
            </div>
            <Button type="submit">Save Route Rule</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
