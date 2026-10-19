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
          'fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-border-subtle bg-surface transition-transform lg:sticky lg:top-0 lg:bottom-auto lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border-subtle px-5">
          <div className="h-9 w-9 rounded-xl bg-taxi-500/10 border border-taxi-500/20 p-1 flex items-center justify-center">
            <img src={logo} alt="" className="h-full w-full object-contain rounded-lg" />
          </div>
          <div>
            <p className="font-display text-sm font-extrabold tracking-tight text-text-primary">Carline</p>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{ROLE_LABELS[role]}</p>
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const Icon = Icons[item.icon] || Icons.Circle
            return (
              <NavLink
                key={item.key}
                to={`/${role}/${item.key}`}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs transition-all duration-150',
                    isActive
                      ? 'bg-taxi-500 text-white font-bold shadow-sm shadow-taxi-500/30'
                      : 'text-text-secondary font-medium hover:bg-slate-100 hover:text-text-primary'
                  )
                }
              >
                <Icon size={16} strokeWidth={2.2} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
