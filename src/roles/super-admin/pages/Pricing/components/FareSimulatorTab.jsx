import { Calculator } from 'lucide-react'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'

export default function FareSimulatorTab({
  simInputs,
  setSimInputs,
  simResult,
  handleCalculateSimulation,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Fare Calculator Simulator</h3>
        <form onSubmit={handleCalculateSimulation} className="space-y-3.5 text-xs">
          <Select
            label="Vehicle Fleets *"
            value={simInputs.vehicle}
            onChange={e => setSimInputs(prev => ({ ...prev, vehicle: e.target.value }))}
            options={[
              { value: 'Sedan', label: 'Sedan' },
              { value: 'SUV', label: 'SUV' },
              { value: 'Van', label: 'Van / MPV' }
            ]}
          />

          <Select
            label="Pickup Landmark *"
            value={simInputs.pickup}
            onChange={e => setSimInputs(prev => ({ ...prev, pickup: e.target.value }))}
            options={[
              { value: 'Airport', label: 'Devi Ahilya Bai Holkar Airport' },
              { value: 'Downtown', label: 'Downtown Center (MG Road)' }
            ]}
          />

          <Select
            label="Destination Landmark *"
            value={simInputs.destination}
            onChange={e => setSimInputs(prev => ({ ...prev, destination: e.target.value }))}
            options={[
              { value: 'Downtown', label: 'Downtown Center (MG Road)' },
              { value: 'Airport', label: 'Devi Ahilya Bai Holkar Airport' }
            ]}
          />

          <Input
            label="Estimated Distance (km) *"
            value={simInputs.distance}
            onChange={e => setSimInputs(prev => ({ ...prev, distance: e.target.value }))}
            placeholder="12.5"
          />

          <Input
            label="Estimated Duration (minutes) *"
            value={simInputs.duration}
            onChange={e => setSimInputs(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="28"
          />

          <Input
            label="Waiting Charge Time (minutes)"
            value={simInputs.waiting}
            onChange={e => setSimInputs(prev => ({ ...prev, waiting: e.target.value }))}
            placeholder="5"
          />

          <Button type="submit" className="w-full" icon={Calculator}>Calculate Fare</Button>
        </form>
      </div>

      <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Fare Calculation Breakdown</h3>

        {simResult ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2">
                <span className="text-text-muted block font-semibold">Standard Fare Breakdown</span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>Base Fare:</span>
                    <span className="font-bold text-text-primary">${simResult.base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance Fare:</span>
                    <span className="font-bold text-text-primary">${simResult.distance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Fare:</span>
                    <span className="font-bold text-text-primary">${simResult.time.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waiting Time Charge:</span>
                    <span className="font-bold text-text-primary">${simResult.waiting.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2">
                <span className="text-text-muted block font-semibold">Taxes & Surcharges</span>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span>Airport Surcharge:</span>
                    <span className="font-bold text-text-primary">${simResult.surcharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (GST 5%):</span>
                    <span className="font-bold text-text-primary">${simResult.tax.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-taxi-500/10 p-5 rounded-2xl border border-taxi-500/25 flex justify-between items-center">
              <div>
                <span className="text-text-secondary text-xs font-semibold">Total Estimated Fare Amount</span>
                <p className="text-[10px] text-text-muted mt-0.5">Calculated using the active rules matrix configuration</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-text-primary font-mono">${simResult.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-24 text-center space-y-2 text-text-muted">
            <Calculator className="mx-auto" size={32} />
            <p className="text-xs font-medium">Specify pickup values and click 'Calculate Fare' to run the simulator.</p>
          </div>
        )}

        <div className="bg-surface p-3 rounded-lg border border-border-subtle text-[11px] text-text-muted">
          🛡️ Fares calculated in simulator reflect simulated customer bookings and does not modify active databases.
        </div>
      </div>
    </div>
  )
}
