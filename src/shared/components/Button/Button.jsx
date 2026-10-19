import clsx from 'clsx'

const variants = {
  primary:
    'bg-taxi-500 text-white hover:bg-taxi-400 active:bg-taxi-600 font-semibold shadow-xs hover:shadow-md hover:shadow-taxi-500/20 border border-transparent',
  secondary:
    'bg-surface text-text-primary hover:bg-surface-hover active:bg-surface-raised border border-border-strong hover:border-slate-400/50 shadow-xs hover:shadow-sm font-medium',
  outline:
    'bg-transparent text-text-primary hover:bg-surface-hover active:bg-surface-raised border border-border-strong hover:border-slate-400/50 font-medium',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover active:bg-surface-raised font-medium',
  danger:
    'bg-signal-red/10 text-signal-red border border-signal-red/30 hover:bg-signal-red/20 active:bg-signal-red/30 shadow-xs font-semibold',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 font-semibold shadow-xs hover:shadow-md hover:shadow-emerald-600/20 border border-transparent',
}

const sizes = {
  xs: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg min-h-[30px]',
  sm: 'text-xs px-3.5 py-2 gap-2 rounded-lg min-h-[34px]',
  md: 'text-sm px-4 py-2 gap-2 rounded-xl min-h-[38px]',
  lg: 'text-sm px-5 py-2.5 gap-2.5 rounded-xl min-h-[42px]',
}

const iconSizes = {
  xs: 14,
  sm: 15,
  md: 16,
  lg: 18,
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
  const selectedSize = sizes[size] ? size : 'md'
  const iconPixelSize = iconSizes[selectedSize] || 16

  return (
    <As
      className={clsx(
        'inline-flex items-center justify-center cursor-pointer select-none transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed whitespace-nowrap',
        variants[variant] || variants.primary,
        sizes[selectedSize],
        className
      )}
      {...props}
    >
      {Icon && <Icon size={iconPixelSize} strokeWidth={2.2} className="shrink-0" />}
      {children}
    </As>
  )
}

