import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStatusDistribution, getSummary } from '../api/dashboardApi'
import { parseError } from '../api/axiosClient'
import { useAuth } from '../hooks/useAuth'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import StatCard from '../components/common/StatCard'
import StatusChart from '../components/applications/StatusChart'
import { INTERVIEW_ROUNDS, labelOf } from '../utils/constants'
import { formatDate, formatDateTime } from '../utils/format'

const PRIORITY_LABELS = { OVERDUE: 'Overdue', DUE_SOON: 'Due soon', UPCOMING: 'Upcoming' }

function daysText(daysLeft) {
  if (daysLeft < 0) return `${-daysLeft} day${daysLeft === -1 ? '' : 's'} overdue`
  if (daysLeft === 0) return 'Due today'
  if (daysLeft === 1) return 'Due tomorrow'
  return `${daysLeft} days left`
}

export default function Dashboard() {
  const { user } = useAuth()
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ key: -1, summary: null, distribution: [], error: '' })

  useEffect(() => {
    let cancelled = false

    Promise.all([getSummary(), getStatusDistribution()])
      .then(([summary, distribution]) => {
        if (!cancelled) setResult({ key: reloadCount, summary, distribution, error: '' })
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ key: reloadCount, summary: null, distribution: [], error: parseError(err).message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [reloadCount])

  const header = (
    <div className="page-header">
      <h1>Welcome, {user.fullName}</h1>
      <p className="muted">Your job search at a glance.</p>
    </div>
  )

  if (result.key !== reloadCount) {
    return <div>{header}<Spinner label="Loading dashboard..." /></div>
  }

  if (result.error) {
    return (
      <div>
        {header}
        <div className="card">
          <ErrorMessage message={result.error} />
          <button className="btn btn-secondary btn-sm" onClick={() => setReloadCount((c) => c + 1)}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  const { summary: s, distribution } = result

  if (s.totalApplications === 0) {
    return (
      <div>
        {header}
        <EmptyState title="No applications yet"
          message="Add your first application and your stats will appear here.">
          <Link to="/applications/new" className="btn btn-primary btn-sm">+ Add application</Link>
        </EmptyState>
      </div>
    )
  }

  return (
    <div>
      {header}

      <div className="stat-grid">
        <StatCard label="Total" value={s.totalApplications} />
        <StatCard label="Submitted" value={s.submitted} hint="Excludes saved" />
        <StatCard label="Interviews" value={s.interview} />
        <StatCard label="Offers" value={s.offer} />
        <StatCard label="Success rate" value={`${s.successRate}%`} hint="Offers / submitted" />
      </div>

      <div className="card dash-section">
        <h2>Applications by status</h2>
        <StatusChart distribution={distribution} />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Upcoming deadlines</h2>
          {s.upcomingDeadlines.length === 0 ? (
            <EmptyState title="No deadlines" message="Add a deadline to a saved application." />
          ) : (
            <ul className="dash-list">
              {s.upcomingDeadlines.map((d) => (
                <li key={d.applicationId} className="dash-item">
                  <div>
                    <Link to={`/applications/${d.applicationId}`}>{d.jobTitle}</Link>
                    <div className="muted small">{d.companyName} · {formatDate(d.deadline)}</div>
                  </div>
                  <div className="dash-meta">
                    <span className={`priority-tag priority-${d.priority.toLowerCase()}`}>
                      {PRIORITY_LABELS[d.priority] ?? d.priority}
                    </span>
                    <span className="muted small">{daysText(d.daysLeft)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Upcoming interviews</h2>
          {s.upcomingInterviews.length === 0 ? (
            <EmptyState title="No upcoming interviews"
              message="Add an interview round from an application's page." />
          ) : (
            <ul className="dash-list">
              {s.upcomingInterviews.map((i) => (
                <li key={i.id} className="dash-item">
                  <div>
                    <Link to={`/applications/${i.applicationId}`}>{i.jobTitle}</Link>
                    <div className="muted small">
                      {i.companyName} · {labelOf(INTERVIEW_ROUNDS, i.round)}
                    </div>
                  </div>
                  <div className="dash-meta muted small">{formatDateTime(i.interviewDate)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
