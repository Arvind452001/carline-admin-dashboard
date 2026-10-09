import clsx from 'clsx'

export default function Filter({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors',
            value === opt.value
              ? 'bg-taxi-500 text-ink'
              : 'bg-surface-raised text-text-secondary hover:bg-surface-hover'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
