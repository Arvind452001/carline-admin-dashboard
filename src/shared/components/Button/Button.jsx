import clsx from 'clsx'

const variants = {
  primary: 'bg-taxi-500 text-ink hover:bg-taxi-400 active:bg-taxi-600 font-semibold',
  secondary: 'bg-surface-raised text-text-primary border border-border-strong hover:bg-surface-hover',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-raised',
  danger: 'bg-signal-red/10 text-signal-red border border-signal-red/30 hover:bg-signal-red/20',
  // Requested by the activate/approve buttons, which passed an undefined key
  // and so rendered with no variant styling at all.
  success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 font-semibold',
}

const sizes = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5',
  md: 'text-sm px-3.5 py-2 gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2',
}

export default function Button({
  as: As = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className,
  children,
  ...props
}) {
  return (
    <As
      className={clsx(
        'inline-flex items-center justify-center rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2.25} />}
      {children}
    </As>
  )
}
