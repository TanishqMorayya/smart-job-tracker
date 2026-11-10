import { useState } from 'react'
import { deleteInterview } from '../../api/interviewApi'
import { parseError } from '../../api/axiosClient'
import InterviewFormModal from './InterviewFormModal'
import ConfirmDialog from '../common/ConfirmDialog'
import EmptyState from '../common/EmptyState'
import ErrorMessage from '../common/ErrorMessage'
import ResultBadge from '../common/ResultBadge'
import { INTERVIEW_MODES, INTERVIEW_ROUNDS, labelOf } from '../../utils/constants'
import { formatDateTime } from '../../utils/format'

export default function InterviewsSection({ applicationId, interviews, onChanged }) {
  const [modal, setModal] = useState(null) // null = closed, { interview } = open (interview is null when adding)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleSaved = () => {
    setModal(null)
    onChanged()
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      await deleteInterview(toDelete.id)
      setToDelete(null)
      onChanged()
    } catch (err) {
      setError(parseError(err).message)
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="card">
      <div className="section-head">
        <h2>Interviews</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({ interview: null })}>
          + Add interview
        </button>
      </div>
      <ErrorMessage message={error} />

      {interviews.length === 0 ? (
        <EmptyState title="No interviews yet" message="Add each interview round to track it." />
      ) : (
        <ul className="interview-list">
          {interviews.map((i) => (
            <li key={i.id} className="interview-item">
              <div className="interview-main">
                <strong>{labelOf(INTERVIEW_ROUNDS, i.round)}</strong>
                <ResultBadge result={i.result} />
              </div>
              <div className="muted small">
                {formatDateTime(i.interviewDate)}
                {i.mode && ` · ${labelOf(INTERVIEW_MODES, i.mode)}`}
                {i.interviewer && ` · ${i.interviewer}`}
              </div>
              {i.notes && <div className="small">{i.notes}</div>}
              <div className="row-actions">
                <button className="link-btn" onClick={() => setModal({ interview: i })}>Edit</button>
                <button className="link-btn danger" onClick={() => setToDelete(i)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <InterviewFormModal applicationId={applicationId} interview={modal.interview}
          onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {toDelete && (
        <ConfirmDialog title="Delete this interview?"
          message="It will also disappear from the timeline."
          confirmLabel="Delete" busyLabel="Deleting..." busy={deleting}
          onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
      )}
    </div>
  )
}
