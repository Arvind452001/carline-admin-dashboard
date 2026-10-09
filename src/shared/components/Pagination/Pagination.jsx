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
          className="rounded-md p-1.5 text-text-muted hover:bg-surface-raised hover:text-text-primary disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={clsx(
              'h-7 w-7 rounded-md text-xs font-medium',
              p === page ? 'bg-taxi-500 text-ink' : 'text-text-secondary hover:bg-surface-raised'
            )}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-md p-1.5 text-text-muted hover:bg-surface-raised hover:text-text-primary disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
