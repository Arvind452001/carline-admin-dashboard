import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'

export default function TimePricingTab({
  timeRules,
  setTimeRules,
  newTimeRule,
  setNewTimeRule,
}) {
  const handleAddTimeRule = (e) => {
    e.preventDefault()
    if (!newTimeRule.name) return
    setTimeRules(prev => [
      ...prev,
      {
        name: newTimeRule.name,
        days: newTimeRule.days,
        startTime: newTimeRule.startTime,
        endTime: newTimeRule.endTime,
        adjustment: newTimeRule.adjustmentType === 'Percent' ? `+${newTimeRule.adjustmentValue}%` : `$${newTimeRule.adjustmentValue}`,
        status: newTimeRule.status
      }
    ])
    setNewTimeRule({
      name: '',
      days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false },
      startTime: '22:00',
      endTime: '06:00',
      adjustmentType: 'Percent',
      adjustmentValue: '20',
      status: 'active'
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Active Time-Based Fare Modifiers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Rule Name</th>
                <th className="py-2.5 px-3">Active Days</th>
                <th className="py-2.5 px-3">Start Time</th>
                <th className="py-2.5 px-3">End Time</th>
                <th className="py-2.5 px-3">Adjustment</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {timeRules.map((tr, idx) => (
                <tr key={idx} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-text-primary">{tr.name}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1">
                      {Object.entries(tr.days).map(([day, active]) => (
                        <span key={day} className={`px-1 rounded text-[10px] ${active ? 'bg-taxi-500/20 text-taxi-600 font-bold' : 'bg-surface text-text-muted line-through'}`}>
                          {day}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono">{tr.startTime}</td>
                  <td className="py-3 px-3 font-mono">{tr.endTime}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600">{tr.adjustment}</td>
                  <td className="py-3 px-3"><StatusBadge status={tr.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Create Time-Based Pricing</h3>
        <form onSubmit={handleAddTimeRule} className="space-y-3.5 text-xs">
          <Input
            label="Rule Name *"
            value={newTimeRule.name}
            onChange={e => setNewTimeRule(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Weekend Late Night"
          />

          <div>
            <label className="block text-text-secondary mb-1 font-semibold">Active Days Selection</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <label key={day} className="flex items-center gap-1 cursor-pointer bg-surface hover:bg-surface-hover px-2 py-1 rounded border border-border-subtle text-[11px]">
                  <input
                    type="checkbox"
                    checked={newTimeRule.days[day]}
                    onChange={e => {
                      const active = e.target.checked
                      setNewTimeRule(prev => ({
                        ...prev,
                        days: { ...prev.days, [day]: active }
                      }))
                    }}
                    className="w-3.5 h-3.5 text-taxi-500 focus:ring-taxi-500"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Start Time"
              type="time"
              value={newTimeRule.startTime}
              onChange={e => setNewTimeRule(prev => ({ ...prev, startTime: e.target.value }))}
            />
            <Input
              label="End Time"
              type="time"
              value={newTimeRule.endTime}
              onChange={e => setNewTimeRule(prev => ({ ...prev, endTime: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select
              label="Adjustment Type"
              value={newTimeRule.adjustmentType}
              onChange={e => setNewTimeRule(prev => ({ ...prev, adjustmentType: e.target.value }))}
              options={[
                { value: 'Percent', label: 'Percentage' },
                { value: 'Flat', label: 'Flat Amount' }
              ]}
            />
            <Input
              label="Adjustment Value"
              value={newTimeRule.adjustmentValue}
              onChange={e => setNewTimeRule(prev => ({ ...prev, adjustmentValue: e.target.value }))}
              placeholder="e.g. 20"
            />
          </div>

          <Button type="submit" className="w-full">Initialize Time Rule</Button>
        </form>
      </div>
    </div>
  )
}
