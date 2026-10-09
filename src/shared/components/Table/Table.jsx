import clsx from 'clsx'
import EmptyState from '@/shared/components/EmptyState'

// A column may carry:
//   align     - 'left' | 'center' | 'right' (numbers read better right-aligned)
//   sticky    - 'right' keeps the column visible while the rest scrolls, which
//               is how the row actions stay reachable on wide tables
//   width     - any Tailwind width class for the column
//   cellClassName / headerClassName - extra classes for that column only
//
// `rows` empty renders the shared empty state instead of an empty grid.
export default function Table({
  columns,
  rows,
  keyField = 'id',
  emptyLabel = 'No records found',
  borderless = false,
  density = 'comfortable',
  className,
}) {
  if (!rows || rows.length === 0) return <EmptyState title={emptyLabel} />

  const padding = density === 'compact' ? 'px-4 py-2.5' : 'px-5 py-3.5'

  // Sticky cells cannot be transparent or the scrolled rows show through them,
  // so they keep an opaque surface colour and follow the row hover themselves.
  function alignClass(col) {
    if (col.align === 'right') return 'text-right'
    if (col.align === 'center') return 'text-center'
    return ''
  }

  function stickyClass(col) {
    if (col.sticky !== 'right') return ''
    return 'sticky right-0 z-[1] bg-surface group-hover:bg-surface-raised shadow-[-10px_0_10px_-10px_rgba(46,41,34,0.10)]'
  }

  // The header keeps its own tint, so it only borrows the position and shadow
  // from the sticky column rather than the opaque body background.
  function headerStickyClass(col) {
    if (col.sticky !== 'right') return ''
    return 'right-0 shadow-[-10px_0_10px_-10px_rgba(46,41,34,0.10)]'
  }

  return (
    <div
      className={clsx(
        'w-full',
        borderless
          ? 'overflow-x-auto'
          : 'overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-[0_1px_3px_rgba(46,41,34,0.04)]',
        className
      )}
    >
      <div className={borderless ? '' : 'overflow-x-auto'}>
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={clsx(
                    'sticky top-0 z-[2] whitespace-nowrap border-b border-border-strong bg-surface-raised',
                    'text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary',
                    padding,
                    col.width,
                    alignClass(col),
                    headerStickyClass(col),
                    col.headerClassName
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isLastRow = index === rows.length - 1
              return (
                <tr
                  key={row[keyField] ?? index}
                  className="group transition-colors hover:bg-surface-raised/60"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={clsx(
                        'align-middle text-text-secondary',
                        padding,
                        !isLastRow && 'border-b border-border-subtle',
                        col.width,
                        alignClass(col),
                        stickyClass(col),
                        col.cellClassName
                      )}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
