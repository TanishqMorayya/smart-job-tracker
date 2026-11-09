import EmptyState from '../common/EmptyState'
import { INTERVIEW_MODES, INTERVIEW_ROUNDS, INTERVIEW_RESULTS, labelOf } from '../../utils/constants'
import { formatDateTime } from '../../utils/format'

export default function InterviewsSection({ interviews, onAdd, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="card-head">
        <h2>Interviews ({interviews.length})</h2>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>+ Add interview</button>
      </div>

      {interviews.length === 0 ? (
        <EmptyState title="No interviews yet"
          message="Add a round when you get an interview call." />
      ) : (
        <ul className="interview-list">
          {interviews.map((i) => (
            <li key={i.id} className="interview-item">
              <div className="interview-main">
                <div className="interview-title">
                  {labelOf(INTERVIEW_ROUNDS, i.round)}
                  <span className={`result-tag result-${i.result.toLowerCase()}`}>
                    {labelOf(INTERVIEW_RESULTS, i.result)}
                  </span>
                </div>
                <div className="muted small">
                  {formatDateTime(i.interviewDate)}
                  {i.mode && ` · ${labelOf(INTERVIEW_MODES, i.mode)}`}
                  {i.interviewer && ` · ${i.interviewer}`}
                </div>
                {i.notes && <div className="timeline-desc">{i.notes}</div>}
              </div>
              <div className="row-actions">
                <button className="link-btn" onClick={() => onEdit(i)}>Edit</button>
                <button className="link-btn link-danger" onClick={() => onDelete(i)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
