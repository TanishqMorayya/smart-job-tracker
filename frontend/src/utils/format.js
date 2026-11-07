const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormat = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

// '2026-11-07' -> '07 Nov 2026'. Parsed by hand so the date never shifts with the time zone.
export function formatDate(value) {
  if (!value) return '-'
  const [year, month, day] = value.split('-').map(Number)
  return dateFormat.format(new Date(year, month - 1, day))
}

// '2026-11-25T15:00:00' -> '25 Nov 2026, 03:00 pm'
export function formatDateTime(value) {
  if (!value) return '-'
  return dateTimeFormat.format(new Date(value))
}
