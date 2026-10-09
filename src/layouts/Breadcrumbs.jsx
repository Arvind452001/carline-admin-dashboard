import { useLocation, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { titleCase } from '@/shared/utils/formatting'

export default function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/')
        const isLast = i === segments.length - 1
        return (
          <span key={path} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} className="text-text-muted" />}
            {isLast ? (
              <span className="font-medium text-text-primary">{titleCase(seg)}</span>
            ) : (
              <Link to={path} className="text-text-muted hover:text-text-secondary">
                {titleCase(seg)}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
