// Number grouping stays on `en-IN`, but the currency symbol is never hardcoded:
// it is whatever the API last reported (see setCurrencySymbol). Changing the
// backend currency therefore re-labels every amount with no frontend change.
const AMOUNT_FORMAT = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

let activeCurrencySymbol = ''

export function setCurrencySymbol(symbol) {
  if (typeof symbol === 'string' && symbol.trim()) activeCurrencySymbol = symbol.trim()
}

export function getCurrencySymbol() {
  return activeCurrencySymbol
}

export function currency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '-'
  return `${activeCurrencySymbol}${AMOUNT_FORMAT.format(amount)}`
}

// Fares and rate breakdowns carry decimals, which the panel-wide formatter
// rounds away. Same backend-driven symbol, two decimals kept.
const PRECISE_AMOUNT_FORMAT = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function currencyPrecise(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '-'
  return `${activeCurrencySymbol}${PRECISE_AMOUNT_FORMAT.format(amount)}`
}

export function titleCase(str) {
  if (typeof str !== 'string') return ''
  return str
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((w) => (w && w[0] ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ')
}

export function initials(name) {
  if (typeof name !== 'string') return ''
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => (n && n[0] ? n[0].toUpperCase() : ''))
    .join('')
}
