import { Calendar } from 'lucide-react'

export default function DatePicker({ label, value, onChange }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</span>}
      <div className="relative">
        <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border-subtle bg-surface py-2 pl-9 pr-3 text-sm text-text-primary focus:border-taxi-500 focus:outline-none"
        />
      </div>
    </label>
  )
}
