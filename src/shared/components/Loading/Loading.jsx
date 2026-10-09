export default function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-3 text-text-muted">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-strong border-t-taxi-500" />
      <span className="text-xs">{label}</span>
    </div>
  )
}
