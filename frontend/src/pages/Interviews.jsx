import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteInterview, listPastInterviews, listUpcomingInterviews } from '../api/interviewApi'
import { parseError } from '../api/axiosClient'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import ConfirmDialog from '../components/common/ConfirmDialog'
import InterviewForm from '../components/applications/InterviewForm'
import { INTERVIEW_MODES, INTERVIEW_ROUNDS, INTERVIEW_RESULTS, labelOf } from '../utils/constants'
import { formatDateTime } from '../utils/format'

const LIMIT = 50 // the backend allows 1 to 50

function InterviewTable({ rows, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Company</th>
            <th>Job title</th>
            <th>Round</th>
            <th>Mode</th>
            <th>Interviewer</th>
            <th>Result</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i.id}>
              <td>{formatDateTime(i.interviewDate)}</td>
              <td>{i.companyName}</td>
              <td><Link to={`/applications/${i.applicationId}`}>{i.jobTitle}</Link></td>
              <td>{labelOf(INTERVIEW_ROUNDS, i.round)}</td>
              <td>{i.mode ? labelOf(INTERVIEW_MODES, i.mode) : '-'}</td>
              <td>{i.interviewer || '-'}</td>
              <td>
                <span className={`result-tag result-${i.result.toLowerCase()}`}>
                  {labelOf(INTERVIEW_RESULTS, i.result)}
                </span>
              </td>
              <td className="row-actions">
                <button className="link-btn" onClick={() => onEdit(i)}>Edit</button>
                <button className="link-btn link-danger" onClick={() => onDelete(i)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Interviews() {
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ key: -1, upcoming: null, past: null, error: '' })

  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [pageError, setPageError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let cancelled = false

    Promise.all([listUpcomingInterviews(LIMIT), listPastInterviews(LIMIT)])
      .then(([upcoming, past]) => {
        if (!cancelled) setResult({ key: reloadCount, upcoming, past, error: '' })
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ key: reloadCount, upcoming: null, past: null, error: parseError(err).message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [reloadCount])

  const reload = () => setReloadCount((c) => c + 1)
  const loading = result.key !== reloadCount

  const handleSaved = (message) => {
    setEditTarget(null)
    setPageError('')
    setNotice(message)
    reload()
  }

  const handleDelete = async () => {
    setDeleting(true)
    setPageError('')
    setNotice('')
    try {
      await deleteInterview(deleteTarget.id)
      setNotice('Interview deleted')
      reload()
    } catch (err) {
      setPageError(parseError(err).message)
    } finally {
      setDeleteTarget(null)
      setDeleting(false)
    }
  }

  let body
  if (loading && !result.upcoming) {
    body = <Spinner label="Loading interviews..." />
  } else if (result.error) {
    body = (
      <div className="card">
        <ErrorMessage message={result.error} />
        <button className="btn btn-secondary btn-sm" onClick={reload}>Try again</button>
      </div>
    )
  } else {
    const { upcoming, past } = result
    body = (
      <div className={loading ? 'dim' : undefined}>
        <h2 className="section-title">Upcoming ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <EmptyState title="No upcoming interviews"
            message="Open an application and add an interview round to see it here." />
        ) : (
          <InterviewTable rows={upcoming} onEdit={setEditTarget} onDelete={setDeleteTarget} />
        )}

        <h2 className="section-title">Past ({past.length})</h2>
        {past.length === 0 ? (
          <EmptyState title="No past interviews" message="Completed interviews will appear here." />
        ) : (
          <InterviewTable rows={past} onEdit={setEditTarget} onDelete={setDeleteTarget} />
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>Interviews</h1>
        <p className="muted">All interview rounds across your applications.</p>
      </div>

      <ErrorMessage message={pageError} />
      {notice && <div className="alert alert-info" role="status">{notice}</div>}
      {body}

      {editTarget && (
        <InterviewForm key={editTarget.id} interview={editTarget}
          applicationId={editTarget.applicationId}
          onSaved={handleSaved} onCancel={() => setEditTarget(null)} />
      )}

      {deleteTarget && (
        <ConfirmDialog title="Delete this interview?"
          message={`${labelOf(INTERVIEW_ROUNDS, deleteTarget.round)} round at ${deleteTarget.companyName} will be removed. This cannot be undone.`}
          confirmLabel="Delete" busyLabel="Deleting..." busy={deleting}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}
