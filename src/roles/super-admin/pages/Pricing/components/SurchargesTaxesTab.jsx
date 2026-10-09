import { Check } from 'lucide-react'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'

export default function SurchargesTaxesTab({ surcharges, setSurcharges }) {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-6">
      <div className="flex justify-between items-center border-b border-border-subtle pb-2">
        <h3 className="text-sm font-bold text-text-primary">Global Surcharges & Tax configuration</h3>
        <Button size="sm" icon={Check} onClick={() => alert('Surcharges updated successfully!')}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="space-y-4 bg-surface p-4 rounded-xl border border-border-subtle">
          <h4 className="font-bold text-text-primary flex items-center gap-1.5 border-b border-border-subtle pb-1">📍 Dynamic Surcharges</h4>
          <div className="space-y-3">
            <Input
              label="Airport Surcharge"
              value={surcharges.airportSurcharge}
              onChange={e => setSurcharges(prev => ({ ...prev, airportSurcharge: e.target.value }))}
            />
            <Input
              label="Night Surcharge (flat or %)"
              value={surcharges.nightSurcharge}
              onChange={e => setSurcharges(prev => ({ ...prev, nightSurcharge: e.target.value }))}
            />
            <Input
              label="Weekend Surcharge (flat or %)"
              value={surcharges.weekendSurcharge}
              onChange={e => setSurcharges(prev => ({ ...prev, weekendSurcharge: e.target.value }))}
            />
            <Input
              label="Holiday Surcharge"
              value={surcharges.holidaySurcharge}
              onChange={e => setSurcharges(prev => ({ ...prev, holidaySurcharge: e.target.value }))}
            />
            <Input
              label="Peak Hour Surcharge"
              value={surcharges.peakHourSurcharge}
              onChange={e => setSurcharges(prev => ({ ...prev, peakHourSurcharge: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-4 bg-surface p-4 rounded-xl border border-border-subtle">
          <h4 className="font-bold text-text-primary flex items-center gap-1.5 border-b border-border-subtle pb-1">📊 Platform Fees & Taxes</h4>
          <div className="space-y-3">
            <Select
              label="Tax Type"
              value={surcharges.taxType}
              onChange={e => setSurcharges(prev => ({ ...prev, taxType: e.target.value }))}
              options={[
                { value: 'GST', label: 'GST (Goods & Services Tax)' },
                { value: 'VAT', label: 'VAT (Value Added Tax)' },
                { value: 'Sales Tax', label: 'Sales Tax' }
              ]}
            />
            <Input
              label="Tax %"
              value={surcharges.taxPercent}
              onChange={e => setSurcharges(prev => ({ ...prev, taxPercent: e.target.value }))}
            />
            <Input
              label="Service Fee"
              value={surcharges.serviceFee}
              onChange={e => setSurcharges(prev => ({ ...prev, serviceFee: e.target.value }))}
            />
            <Input
              label="Other Fee"
              value={surcharges.otherFee}
              onChange={e => setSurcharges(prev => ({ ...prev, otherFee: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
