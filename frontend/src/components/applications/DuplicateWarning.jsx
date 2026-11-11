import { Link } from 'react-router-dom'
import Modal from '../common/Modal'
import StatusBadge from '../common/StatusBadge'
import { formatDate } from '../../utils/format'

export default function DuplicateWarning({ matches, busy, onConfirm, onCancel }) {
  return (
    <Modal title="You may have already added this" onClose={onCancel} busy={busy}>
      <p className="muted">
        You already have {matches.length === 1 ? 'an application' : `${matches.length} applications`}{' '}
        for this role at {matches[0].companyName}:
      </p>
      <ul className="mini-list">
        {matches.map((m) => (
          <li key={m.id}>
            <div className="mini-row">
              <Link to={`/applications/${m.id}`} target="_blank" rel="noopener noreferrer">
                {m.jobTitle}
              </Link>
              <StatusBadge status={m.status} />
            </div>
            <span className="muted small">
              Applied: {formatDate(m.appliedDate)} · Added: {formatDate(m.createdAt.slice(0, 10))}
            </span>
          </li>
        ))}
      </ul>
      <p className="muted small">
        Adding it again is fine, for example for a different round or posting.
      </p>
      <div className="btn-row">
        <button className="btn btn-primary btn-sm" onClick={onConfirm} disabled={busy}>
          {busy ? 'Saving...' : 'Add anyway'}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </Modal>
  )
}
