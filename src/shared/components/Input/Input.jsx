import clsx from 'clsx'

export default function Input({ label, icon: Icon, rightElement, className, containerClassName, ...props }) {
  return (
    <label className={clsx('block', containerClassName)}>
      {label && <span className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</span>}
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />}
        <input
          className={clsx(
            'w-full rounded-xl border border-border-subtle bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 transition-all focus:border-taxi-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-taxi-500/20',
            Icon && 'pl-10',
            rightElement && 'pr-16',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </label>
  )
}
