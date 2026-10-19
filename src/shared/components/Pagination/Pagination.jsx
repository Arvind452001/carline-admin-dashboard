import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5)
  return (
    <div className="flex items-center justify-between border-t border-border-subtle pt-3">
      <p className="text-xs text-text-muted">
        Page <span className="text-text-secondary">{page}</span> of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-border-subtle bg-surface transition-all active:scale-95"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={clsx(
              'h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer active:scale-95',
              p === page
                ? 'bg-taxi-500 text-white shadow-xs'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border-subtle bg-surface'
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer border border-border-subtle bg-surface transition-all active:scale-95"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
