import clsx from 'clsx'

export default function Filter({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer active:scale-95',
            value === opt.value
              ? 'bg-taxi-500 text-white shadow-xs'
              : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border-subtle shadow-xs'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
