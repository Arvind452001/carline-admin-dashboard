import clsx from 'clsx'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function KpiCard({ label, value, delta, trend, tone = 'taxi', hint }) {
  const positive = delta >= 0
  const strokeColor = {
    taxi: '#f5b700',
    green: '#2fd671',
    blue: '#4fb6ff',
    red: '#ff5c5c',
  }[tone] || '#f5b700'

  const safeId = `grad-${(label || '').replace(/\s+/g, '-')}`

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-text-muted">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-text-primary">{value}</p>
          {hint && <p className="mt-0.5 text-[11px] text-text-muted">{hint}</p>}
        </div>
        {delta !== undefined && (
          <span
            className={clsx(
              'flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium',
              positive ? 'bg-signal-green/10 text-signal-green' : 'bg-signal-red/10 text-signal-red'
            )}
          >
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {trend && (
        <div className="mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id={safeId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={strokeColor} strokeWidth={1.5} fill={`url(#${safeId})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
