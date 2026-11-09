const LABELS = { OVERDUE: 'Overdue', DUE_SOON: 'Due soon', UPCOMING: 'Upcoming' }

// The backend sends no priority for finished applications, so nothing is shown for them.
export default function PriorityBadge({ priority }) {
  if (!priority || !LABELS[priority]) return null
  return (
    <span className={`priority-tag priority-${priority.toLowerCase()}`}>{LABELS[priority]}</span>
  )
}
