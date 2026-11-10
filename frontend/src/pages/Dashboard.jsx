import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  getByJobType,
  getBySource,
  getFunnel,
  getMonthly,
  getStatusDistribution,
  getSummary,
} from '../api/dashboardApi'
import { parseError } from '../api/axiosClient'
import StatCard from '../components/dashboard/StatCard'
import CountBarChart from '../components/dashboard/CountBarChart'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import Spinner from '../components/common/Spinner'
import { INTERVIEW_ROUNDS, JOB_TYPES, SOURCES, STATUSES, labelOf } from '../utils/constants'
import { formatDate, formatDateTime } from '../utils/format'

const STATUS_COLORS = {
  SAVED: '#9ca3af',
  APPLIED: '#3b82f6',
  ONLINE_ASSESSMENT: '#8b5cf6',
  INTERVIEW: '#f59e0b',
  OFFER: '#10b981',
  REJECTED: '#ef4444',
  WITHDRAWN: '#6b7280',
}

const PRIORITY_LABELS = {
  OVERDUE: 'Overdue',
  DUE_SOON: 'Due soon',
  UPCOMING: 'Upcoming',
  NO_DEADLINE: 'No deadline',
}

const monthFormat = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' })

// '2026-11' -> 'Nov 26'
function monthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  return monthFormat.format(new Date(year, month - 1, 1))
}

function daysText(days) {
  if (days < 0) {
    const n = -days
    return `Overdue by ${n} day${n === 1 ? '' : 's'}`
  }
  if (days === 0) return 'Due today'
  return `${days} day${days === 1 ? '' : 's'} left`
}

export default function Dashboard() {
  const { user } = useAuth()
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ key: '', data: null, error: '' })

  const queryKey = String(reloadCount)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getSummary(),
      getStatusDistribution(),
      getMonthly(),
      getByJobType(),
      getBySource(),
      getFunnel(),
    ])
      .then(([summary, status, monthly, jobType, source, funnel]) => {
        if (!cancelled) {
          setResult({
            key: queryKey,
            data: { summary, status, monthly, jobType, source, funnel },
            error: '',
          })
        }
      })
      .catch((err) => {
        if (!cancelled) setResult({ key: queryKey, data: null, error: parseError(err).message })
      })

    return () => {
      cancelled = true
    }
  }, [queryKey])

  const header = (
    <div className="page-header page-header-row">
      <div>
        <h1>Welcome, {user.fullName}</h1>
        <p className="muted">Here is how your job search is going.</p>
      </div>
      <Link to="/applications/new" className="btn btn-primary btn-sm">+ Add application</Link>
    </div>
  )

  if (result.key !== queryKey) {
    return (
      <div>
        {header}
        <Spinner label="Loading dashboard..." />
      </div>
    )
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

  const { summary, status, monthly, jobType, source, funnel } = result.data

  if (summary.totalApplications === 0) {
    return (
      <div>
        {header}
        <EmptyState title="Nothing to show yet"
          message="Add your first application and your stats and charts will appear here.">
          <Link to="/applications/new" className="btn btn-primary btn-sm">+ Add application</Link>
        </EmptyState>
      </div>
    )
  }

  const statusData = status.map((i) => ({
    key: i.label,
    label: labelOf(STATUSES, i.label),
    count: i.count,
  }))
  const monthlyData = monthly.map((i) => ({ label: monthLabel(i.label), count: i.count }))
  const jobTypeData = jobType.map((i) => ({ label: labelOf(JOB_TYPES, i.label), count: i.count }))
  const sourceData = source.map((i) => ({
    label: i.label === 'NOT_SET' ? 'Not set' : labelOf(SOURCES, i.label),
    count: i.count,
  }))

  return (
    <div>
      {header}

      <div className="stat-grid">
        <StatCard label="Total applications" value={summary.totalApplications} />
        <StatCard label="Saved" value={summary.saved} hint="Not applied yet" />
        <StatCard label="Submitted" value={summary.submitted} hint="Everything except saved" />
        <StatCard label="Online assessments" value={summary.onlineAssessment} />
        <StatCard label="Interviews" value={summary.interview} />
        <StatCard label="Offers" value={summary.offer} tone="good" />
        <StatCard label="Rejections" value={summary.rejected} tone="bad" />
        <StatCard label="Success rate" value={`${summary.successRate}%`}
          hint="Offers out of submitted" tone="good" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Applications by status</h2>
          <CountBarChart data={statusData} horizontal height={300}
            colorFor={(d) => STATUS_COLORS[d.key]} />
        </div>
        <div className="card">
          <h2>Applications by month</h2>
          <CountBarChart data={monthlyData} height={300} />
        </div>
        <div className="card">
          <h2>By job type</h2>
          <CountBarChart data={jobTypeData} color="#0ea5e9" />
        </div>
        <div className="card">
          <h2>By source</h2>
          <CountBarChart data={sourceData} horizontal color="#14b8a6" />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Your funnel</h2>
          <ul className="funnel-list">
            <li>
              <span>Application to interview</span>
              <strong>{funnel.applicationToInterviewRate}%</strong>
              <span className="muted small">{funnel.interviewed} of {funnel.submitted}</span>
            </li>
            <li>
              <span>Interview to offer</span>
              <strong>{funnel.interviewToOfferRate}%</strong>
              <span className="muted small">{funnel.offered} of {funnel.interviewed}</span>
            </li>
            <li>
              <span>Overall offer rate</span>
              <strong>{funnel.overallOfferRate}%</strong>
              <span className="muted small">{funnel.offered} of {funnel.submitted}</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <h2>Upcoming interviews</h2>
          {summary.upcomingInterviews.length === 0 ? (
            <p className="muted">No upcoming interviews.</p>
          ) : (
            <ul className="mini-list">
              {summary.upcomingInterviews.map((i) => (
                <li key={i.id}>
                  <Link to={`/applications/${i.applicationId}`}>
                    {i.companyName}: {i.jobTitle}
                  </Link>
                  <span className="muted small">
                    {labelOf(INTERVIEW_ROUNDS, i.round)} · {formatDateTime(i.interviewDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Deadlines to watch</h2>
          <p className="muted small">Saved applications that have a deadline.</p>
          {summary.upcomingDeadlines.length === 0 ? (
            <p className="muted">No deadlines on saved applications.</p>
          ) : (
            <ul className="mini-list">
              {summary.upcomingDeadlines.map((d) => (
                <li key={d.applicationId}>
                  <div className="mini-row">
                    <Link to={`/applications/${d.applicationId}`}>
                      {d.companyName}: {d.jobTitle}
                    </Link>
                    <span className={`badge badge-priority-${d.priority.toLowerCase()}`}>
                      {PRIORITY_LABELS[d.priority]}
                    </span>
                  </div>
                  <span className="muted small">
                    {formatDate(d.deadline)} · {daysText(d.daysLeft)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
