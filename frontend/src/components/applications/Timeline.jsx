import EmptyState from '../common/EmptyState'
import { formatDateTime } from '../../utils/format'

export default function Timeline({ events }) {
  if (events.length === 0) {
    return <EmptyState title="No history yet" message="Status changes and interviews will appear here." />
  }

  return (
    <ol className="timeline">
      {events.map((e, index) => (
        <li key={`${e.type}-${e.timestamp}-${index}`}
          className={`timeline-item timeline-${e.type.toLowerCase()}`}>
          <div className="timeline-dot" />
          <div className="timeline-body">
            <div className="timeline-title">
              {e.title}
              {e.upcoming && <span className="badge badge-interview">Upcoming</span>}
            </div>
            <div className="muted small">{formatDateTime(e.timestamp)}</div>
            {e.description && <div className="timeline-desc">{e.description}</div>}
          </div>
        </li>
      ))}
    </ol>
  )
}
