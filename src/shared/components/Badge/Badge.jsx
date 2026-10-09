import clsx from 'clsx'

const toneConfigs = {
  green: {
    bg: '#ecfdf5',
    border: '#a7f3d0',
    color: '#15803d',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  },
  amber: {
    bg: '#fffbeb',
    border: '#fde68a',
    color: '#d97706',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  red: {
    bg: '#fef2f2',
    border: '#fecaca',
    color: '#dc2626',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-rose-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  },
  blue: {
    bg: '#f0f9ff',
    border: '#bae6fd',
    color: '#0369a1',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
    )
  },
  purple: {
    bg: '#faf5ff',
    border: '#e9d5ff',
    color: '#7e22ce',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  },
  indigo: {
    bg: '#e0e7ff',
    border: '#c7d2fe',
    color: '#4338ca',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    )
  },
  teal: {
    bg: '#f0fdfa',
    border: '#99f6e4',
    color: '#0f766e',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  },
  slate: {
    bg: '#f8fafc',
    border: '#e2e8f0',
    color: '#475569',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    )
  },
  taxi: {
    bg: '#fff7ed',
    border: '#fed7aa',
    color: '#c2410c',
    icon: (
      <svg className="w-4 h-4 shrink-0 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  },
}

export default function Badge({ tone = 'slate', dot = false, icon, children, className }) {
  const config = toneConfigs[tone] || toneConfigs.slate

  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border whitespace-nowrap shadow-2xs',
        className
      )}
    >
      {icon ? icon : (dot ? config.icon : null)}
      {children}
    </span>
  )
}
