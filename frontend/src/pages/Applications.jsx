import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listApplications } from '../api/applicationApi'
import { parseError } from '../api/axiosClient'
import { useDebounce } from '../hooks/useDebounce'
import StatusBadge from '../components/common/StatusBadge'
import PriorityBadge from '../components/common/PriorityBadge'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import Pagination from '../components/common/Pagination'
import { JOB_TYPES, STATUSES, WORK_MODES, labelOf } from '../utils/constants'
import { formatDate } from '../utils/format'

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  jobType: '',
  workMode: '',
  location: '',
  from: '',
  to: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
  size: '10',
  page: 0,
}

// Values must match the backend sort whitelist.
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date added' },
  { value: 'appliedDate', label: 'Applied date' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'company', label: 'Company' },
  { value: 'status', label: 'Status' },
]

export default function Applications() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ key: '', data: null, error: '' })

  // Text inputs update instantly, but the request uses the debounced value.
  const debouncedSearch = useDebounce(filters.search)
  const debouncedLocation = useDebounce(filters.location)

  const dateError =
    filters.from && filters.to && filters.from > filters.to
      ? "'From' date cannot be after 'To' date"
      : ''

  const params = useMemo(() => {
    const p = {
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
      page: filters.page,
      size: Number(filters.size),
    }
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim()
    if (debouncedLocation.trim()) p.location = debouncedLocation.trim()
    if (filters.status) p.status = filters.status
    if (filters.jobType) p.jobType = filters.jobType
    if (filters.workMode) p.workMode = filters.workMode
    if (!dateError) {
      if (filters.from) p.from = filters.from
      if (filters.to) p.to = filters.to
    }
    return p
  }, [filters, debouncedSearch, debouncedLocation, dateError])

  // One string identifies "which request is current".
  const queryKey = JSON.stringify({ params, reloadCount })

  useEffect(() => {
    let cancelled = false
    const { params: query } = JSON.parse(queryKey)

    listApplications(query)
      .then((data) => {
        if (!cancelled) setResult({ key: queryKey, data, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setResult({ key: queryKey, data: null, error: parseError(err).message })
      })

    // If the filters change before this response arrives, ignore the old response.
    return () => {
      cancelled = true
    }
  }, [queryKey])

  const loading = result.key !== queryKey
  const failed = !loading && result.error
  const data = result.data

  const hasFilters = ['search', 'status', 'jobType', 'workMode', 'location', 'from', 'to'].some(
    (key) => filters[key] !== '',
  )

  // Changing any filter goes back to the first page.
  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((f) => ({ ...f, [name]: value, page: 0 }))
  }

  const clearFilters = () => setFilters(DEFAULT_FILTERS)

  let body
  if (failed) {
    body = (
      <div className="card">
        <ErrorMessage message={result.error} />
        <button className="btn btn-secondary btn-sm" onClick={() => setReloadCount((c) => c + 1)}>
          Try again
        </button>
      </div>
    )
  } else if (!data) {
    body = <Spinner label="Loading applications..." />
  } else if (data.totalElements === 0) {
    body = hasFilters ? (
      <EmptyState title="No applications match your filters"
        message="Try a different search or clear the filters.">
        <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear filters</button>
      </EmptyState>
    ) : (
      <EmptyState title="No applications yet"
        message="Add your first job or internship application to start tracking it.">
        <Link to="/applications/new" className="btn btn-primary btn-sm">+ Add application</Link>
      </EmptyState>
    )
  } else {
    body = (
      <>
        <div className={loading ? 'table-wrap dim' : 'table-wrap'}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Job title</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Deadline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.content.map((a) => (
                <tr key={a.id}>
                  <td>{a.companyName}</td>
                  <td><Link to={`/applications/${a.id}`}>{a.jobTitle}</Link></td>
                  <td>{labelOf(JOB_TYPES, a.jobType)}</td>
                  <td>{a.location || '-'}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td>{formatDate(a.appliedDate)}</td>
                  <td>{formatDate(a.deadline)} <PriorityBadge priority={a.deadlinePriority} /></td>
                  <td><Link to={`/applications/${a.id}/edit`}>Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={data.page} totalPages={data.totalPages}
          onChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
      </>
    )
  }

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>Applications</h1>
          {data && <p className="muted">{data.totalElements} total</p>}
        </div>
        <Link to="/applications/new" className="btn btn-primary btn-sm">+ Add application</Link>
      </div>

      <div className="card filters">
        <div className="filters-grid">
          <div className="form-field">
            <label htmlFor="search">Search</label>
            <input id="search" name="search" placeholder="Company or job title"
              value={filters.search} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={filters.status} onChange={handleChange}>
              <option value="">All</option>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="jobType">Job type</label>
            <select id="jobType" name="jobType" value={filters.jobType} onChange={handleChange}>
              <option value="">All</option>
              {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="workMode">Work mode</label>
            <select id="workMode" name="workMode" value={filters.workMode} onChange={handleChange}>
              <option value="">All</option>
              {WORK_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" placeholder="e.g. Bengaluru"
              value={filters.location} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="from">Applied from</label>
            <input id="from" name="from" type="date" value={filters.from} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="to">Applied to</label>
            <input id="to" name="to" type="date" value={filters.to} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label htmlFor="sortBy">Sort by</label>
            <select id="sortBy" name="sortBy" value={filters.sortBy} onChange={handleChange}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="sortDir">Order</label>
            <select id="sortDir" name="sortDir" value={filters.sortDir} onChange={handleChange}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="size">Rows per page</label>
            <select id="size" name="size" value={filters.size} onChange={handleChange}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>
        {hasFilters && (
          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      <ErrorMessage message={dateError} />
      {body}
    </div>
  )
}
