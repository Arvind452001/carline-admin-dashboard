import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'

// Full screen viewer for an image preview. The stored upload paths are not
// always reachable, so a failed load reports itself instead of rendering a
// broken image.
export default function ImageLightbox({ open, src, title, onClose }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src, open])

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return undefined
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, handleKeyDown])

  if (!open || !src) return null

  const stop = (event) => event.stopPropagation()

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex w-full max-w-6xl items-center justify-between gap-3 text-white" onClick={stop}>
        <span className="truncate text-sm font-medium">{title}</span>
        <div className="flex shrink-0 items-center gap-1">
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/80 hover:bg-white/10 hover:text-white"
          >
            <ExternalLink size={14} />
            Open in new tab
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {failed ? (
        <div
          className="rounded-xl bg-surface-raised px-8 py-10 text-center shadow-2xl"
          onClick={stop}
        >
          <p className="text-sm font-semibold text-text-primary">Could not load this file</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-text-secondary">
            The server did not return an image at this path. The file name is on record, but the document is not
            being served.
          </p>
        </div>
      ) : (
        <img
          src={src}
          alt={title}
          onClick={stop}
          onError={() => setFailed(true)}
          className="max-h-[80vh] max-w-[90vw] rounded-lg bg-white object-contain shadow-2xl"
        />
      )}
    </div>
  )
}
