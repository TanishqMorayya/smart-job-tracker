import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteApplication, getApplication, getTimeline } from '../api/applicationApi'
import { parseError } from '../api/axiosClient'
import StatusBadge from '../components/common/StatusBadge'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Timeline from '../components/applications/Timeline'
import StatusChanger from '../components/applications/StatusChanger'
import { JOB_TYPES, SOURCES, WORK_MODES, labelOf } from '../utils/constants'
import { formatDate } from '../utils/format'

function Detail({ label, children }) {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span>{children || '-'}</span>
    </div>
  )
}

export default function ApplicationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ key: '', application: null, timeline: [], error: '' })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const queryKey = `${id}:${reloadCount}`

  useEffect(() => {
    let cancelled = false

    Promise.all([getApplication(id), getTimeline(id)])
      .then(([application, timeline]) => {
        if (!cancelled) setResult({ key: queryKey, application, timeline, error: '' })
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ key: queryKey, application: null, timeline: [], error: parseError(err).message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [id, queryKey])

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteApplication(id)
      navigate('/applications')
    } catch (err) {
      setDeleteError(parseError(err).message)
      setConfirmDelete(false)
      setDeleting(false)
    }
  }

  if (result.key !== queryKey) return <Spinner label="Loading application..." />

  if (result.error) {
    return (
      <div className="card">
        <ErrorMessage message={result.error} />
        <Link to="/applications" className="btn btn-secondary btn-sm">Back to applications</Link>
      </div>
    )
  }

  const a = result.application

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <Link to="/applications" className="back-link">&larr; Applications</Link>
          <h1>{a.jobTitle}</h1>
          <p className="muted">{a.companyName} <StatusBadge status={a.status} /></p>
        </div>
        <div className="btn-row">
          <Link to={`/applications/${a.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(true)}>Delete</button>
        </div>
      </div>

      <ErrorMessage message={deleteError} />

      <div className="detail-layout">
        <div className="card">
          <h2>Details</h2>
          <div className="detail-grid">
            <Detail label="Company">{a.companyName}</Detail>
            <Detail label="Job type">{labelOf(JOB_TYPES, a.jobType)}</Detail>
            <Detail label="Work mode">{a.workMode && labelOf(WORK_MODES, a.workMode)}</Detail>
            <Detail label="Location">{a.location}</Detail>
            <Detail label="Salary / CTC">{a.salary}</Detail>
            <Detail label="Source">{a.source && labelOf(SOURCES, a.source)}</Detail>
            <Detail label="Applied date">{a.appliedDate && formatDate(a.appliedDate)}</Detail>
            <Detail label="Deadline">{a.deadline && formatDate(a.deadline)}</Detail>
            <Detail label="Resume used">{a.resumeUsed}</Detail>
            <Detail label="Job link">
              {a.jobUrl && (
                <a href={a.jobUrl} target="_blank" rel="noopener noreferrer">Open posting</a>
              )}
            </Detail>
          </div>
          {a.notes && (
            <div className="notes-block">
              <span className="detail-label">Notes</span>
              <p>{a.notes}</p>
            </div>
          )}
        </div>

        <div className="detail-side">
          <div className="card">
            <h2>Update status</h2>
            <StatusChanger applicationId={a.id} currentStatus={a.status}
              onChanged={() => setReloadCount((c) => c + 1)} />
          </div>
          <div className="card">
            <h2>Timeline</h2>
            <Timeline events={result.timeline} />
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog title="Delete this application?"
          message="This also removes its status history and interviews. This cannot be undone."
          confirmLabel="Delete" busyLabel="Deleting..." busy={deleting}
          onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />
      )}
    </div>
  )
}
