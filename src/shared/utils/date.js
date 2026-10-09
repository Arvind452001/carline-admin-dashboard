export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(minutesAgo) {
  if (minutesAgo < 60) return `${minutesAgo}m ago`
  if (minutesAgo < 1440) return `${Math.floor(minutesAgo / 60)}h ago`
  return `${Math.floor(minutesAgo / 1440)}d ago`
}
