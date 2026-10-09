import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'

export default function Select({ label, options = [], className, containerClassName, ...props }) {
  return (
    <label className={clsx('block', containerClassName)}>
      {label && <span className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</span>}
      <div className="relative">
        <select
          className={clsx(
            'w-full appearance-none rounded-lg border border-border-subtle bg-surface px-3 py-2 pr-8 text-sm text-text-primary transition-colors focus:border-taxi-500 focus:outline-none',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
      </div>
    </label>
  )
}
