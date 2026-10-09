import { Car, Clock, Save } from 'lucide-react'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'

export default function ZoneRestrictionsTab({ restrictions, setRestrictions }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm space-y-5">
      <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Global Zone Operations Limitations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="space-y-4 bg-surface p-4 rounded-xl border border-border-subtle">
          <h4 className="font-bold text-text-primary flex items-center gap-1.5"><Car size={16} className="text-taxi-500" /> Permitted Vehicle Fleets</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={restrictions.Sedan}
                onChange={e => setRestrictions(prev => ({ ...prev, Sedan: e.target.checked }))}
                className="w-4 h-4 text-taxi-500 focus:ring-taxi-500"
              />
              <span>Sedan (Active on default routes)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={restrictions.SUV}
                onChange={e => setRestrictions(prev => ({ ...prev, SUV: e.target.checked }))}
                className="w-4 h-4 text-taxi-500 focus:ring-taxi-500"
              />
              <span>SUV (Active on premium routes)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={restrictions.Van}
                onChange={e => setRestrictions(prev => ({ ...prev, Van: e.target.checked }))}
                className="w-4 h-4 text-taxi-500 focus:ring-taxi-500"
              />
              <span>Van (Cargo & Group transport dispatch restricted)</span>
            </label>
          </div>
        </div>

        <div className="space-y-4 bg-surface p-4 rounded-xl border border-border-subtle">
          <h4 className="font-bold text-text-primary flex items-center gap-1.5"><Clock size={16} className="text-taxi-500" /> Operational Hours & Dispatch Limits</h4>
          <div className="space-y-3">
            <Input
              label="Daily Working Window"
              value={restrictions.operatingHours}
              onChange={e => setRestrictions(prev => ({ ...prev, operatingHours: e.target.value }))}
            />
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restrictions.airportPickup}
                  onChange={e => setRestrictions(prev => ({ ...prev, airportPickup: e.target.checked }))}
                  className="w-4 h-4 text-taxi-500 focus:ring-taxi-500"
                />
                <span>Enforce Airport queue entry limits</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restrictions.longDistance}
                  onChange={e => setRestrictions(prev => ({ ...prev, longDistance: e.target.checked }))}
                  className="w-4 h-4 text-taxi-500 focus:ring-taxi-500"
                />
                <span>Flag out-of-province trips as review-required</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end border-t border-border-subtle pt-4">
        <Button icon={Save} onClick={() => alert('Restrictions Saved!')}>Save Restriction Rules</Button>
      </div>
    </div>
  )
}
