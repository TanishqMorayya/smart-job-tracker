import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteInterview, listAllInterviews } from '../api/interviewApi'
import { parseError } from '../api/axiosClient'
import InterviewFormModal from '../components/interviews/InterviewFormModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import ResultBadge from '../components/common/ResultBadge'
import Spinner from '../components/common/Spinner'
import { INTERVIEW_MODES, INTERVIEW_ROUNDS, labelOf } from '../utils/constants'
import { formatDateTime } from '../utils/format'

const VIEWS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'All' },
]

export default function Interviews() {
  const [view, setView] = useState('upcoming')
  const [reloadCount, setReloadCount] = useState(0)
  // fetchedAt is the time the list was loaded: it decides what is "upcoming".
  const [result, setResult] = useState({ key: '', data: null, fetchedAt: 0, error: '' })
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const queryKey = String(reloadCount)

  useEffect(() => {
    let cancelled = false

    listAllInterviews()
      .then((data) => {
        if (!cancelled) setResult({ key: queryKey, data, fetchedAt: Date.now(), error: '' })
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ key: queryKey, data: null, fetchedAt: 0, error: parseError(err).message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [queryKey])

  const reload = () => setReloadCount((c) => c + 1)
  const loading = result.key !== queryKey
  const failed = !loading && result.error
  const all = result.data

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteInterview(toDelete.id)
      setToDelete(null)
      reload()
    } catch (err) {
      setDeleteError(parseError(err).message)
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  let body
  if (failed) {
    body = (
      <div className="card">
        <ErrorMessage message={result.error} />
        <button className="btn btn-secondary btn-sm" onClick={reload}>Try again</button>
      </div>
    )
  } else if (!all) {
    body = <Spinner label="Loading interviews..." />
  } else {
    // The API returns newest first. Upcoming is shown nearest first.
    const isUpcoming = (i) => new Date(i.interviewDate).getTime() > result.fetchedAt
    let shown = all
    if (view === 'upcoming') shown = all.filter(isUpcoming).reverse()
    else if (view === 'past') shown = all.filter((i) => !isUpcoming(i))

    if (all.length === 0) {
      body = (
        <EmptyState title="No interviews yet"
          message="Open an application and add an interview round from its details page.">
          <Link to="/applications" className="btn btn-primary btn-sm">Go to applications</Link>
        </EmptyState>
      )
    } else if (shown.length === 0) {
      body = <EmptyState title={`No ${view} interviews`} message="Try another view." />
    } else {
      body = (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date and time</th>
                <th>Company</th>
                <th>Job</th>
                <th>Round</th>
                <th>Mode</th>
                <th>Result</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((i) => (
                <tr key={i.id}>
                  <td>{formatDateTime(i.interviewDate)}</td>
                  <td>{i.companyName}</td>
                  <td><Link to={`/applications/${i.applicationId}`}>{i.jobTitle}</Link></td>
                  <td>{labelOf(INTERVIEW_ROUNDS, i.round)}</td>
                  <td>{i.mode ? labelOf(INTERVIEW_MODES, i.mode) : '-'}</td>
                  <td><ResultBadge result={i.result} /></td>
                  <td>
                    <div className="row-actions">
                      <button className="link-btn" onClick={() => setEditing(i)}>Edit</button>
                      <button className="link-btn danger" onClick={() => setToDelete(i)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Interviews</h1>
        <p className="muted">Interviews are added from an application&apos;s details page.</p>
      </div>

      <div className="tabs">
        {VIEWS.map((v) => (
          <button key={v.value} className={view === v.value ? 'tab active' : 'tab'}
            onClick={() => setView(v.value)}>
            {v.label}
          </button>
        ))}
      </div>

      <ErrorMessage message={deleteError} />
      {body}

      {editing && (
        <InterviewFormModal interview={editing} onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); reload() }} />
      )}
      {toDelete && (
        <ConfirmDialog title="Delete this interview?" message="This cannot be undone."
          confirmLabel="Delete" busyLabel="Deleting..." busy={deleting}
          onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
      )}
    </div>
  )
}
