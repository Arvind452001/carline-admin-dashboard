import { X } from 'lucide-react'

export default function Modal({ open, isOpen, onClose, title, children, footer, size = 'md' }) {
  const isModalOpen = open ?? isOpen
  if (!isModalOpen) return null
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-5xl',
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" onClick={onClose}>
      <div
        className={`flex max-h-[calc(100vh-2rem)] w-full ${sizeClasses[size] || sizeClasses.md} flex-col rounded-2xl border border-border-subtle bg-surface-raised shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border-subtle px-6 py-4 bg-surface">
          <h3 className="font-display text-sm font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-sunken transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        {/* The header and footer stay put while only the body scrolls, so a long
            form can never push its Save button off the bottom of the screen. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-border-subtle px-6 py-4 bg-surface">{footer}</div>
        )}
      </div>
    </div>
  )
}
