import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'
import clsx from 'clsx'
import { ROLE_NAV } from '@/access/roleConfig'
import { ROLE_LABELS } from '@/access/roles'
import { useAuthStore } from '@/store/authStore'
import logo from '@/assets/logo.webp'

export default function Sidebar({ open, onClose }) {
  const role = useAuthStore((s) => s.role)
  const items = ROLE_NAV[role] || []

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-border-strong bg-surface-raised transition-transform lg:sticky lg:top-0 lg:bottom-auto lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border-strong px-5">
          <img src={logo} alt="" className="h-8 w-8 rounded-lg" />
          <div>
            <p className="font-display text-sm font-bold leading-none text-text-primary">Carline</p>
            <p className="mt-0.5 text-[11px] font-medium text-text-secondary">{ROLE_LABELS[role]}</p>
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const Icon = Icons[item.icon] || Icons.Circle
            return (
              <NavLink
                key={item.key}
                to={`/${role}/${item.key}`}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all',
                    isActive
                      ? 'bg-taxi-500 text-white font-semibold shadow-xs'
                      : 'text-text-primary font-medium hover:bg-surface-hover hover:text-text-primary'
                  )
                }
              >
                <Icon size={16} strokeWidth={2.2} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
