import { useEffect, useState } from 'react'
import { deleteCompany, listCompanies } from '../api/companyApi'
import { parseError } from '../api/axiosClient'
import { useDebounce } from '../hooks/useDebounce'
import Spinner from '../components/common/Spinner'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import ConfirmDialog from '../components/common/ConfirmDialog'
import CompanyForm from '../components/applications/CompanyForm'

export default function Companies() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ key: '', data: null, error: '' })

  const [modal, setModal] = useState(null) // null = closed, { company } = open (company null = add)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [pageError, setPageError] = useState('')
  const [notice, setNotice] = useState('')

  const term = debouncedSearch.trim()
  const queryKey = JSON.stringify({ term, reloadCount })

  useEffect(() => {
    let cancelled = false
    const { term: query } = JSON.parse(queryKey)

    listCompanies(query)
      .then((data) => {
        if (!cancelled) setResult({ key: queryKey, data, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setResult({ key: queryKey, data: null, error: parseError(err).message })
      })

    return () => {
      cancelled = true
    }
  }, [queryKey])

  const loading = result.key !== queryKey
  const failed = !loading && result.error
  const data = result.data
  const reload = () => setReloadCount((c) => c + 1)

  const handleSaved = (message) => {
    setModal(null)
    setPageError('')
    setNotice(message)
    reload()
  }

  const handleDelete = async () => {
    setDeleting(true)
    setPageError('')
    setNotice('')
    try {
      await deleteCompany(deleteTarget.id)
      setNotice(`"${deleteTarget.name}" deleted`)
      reload()
    } catch (err) {
      // 409 (company still has applications) arrives here with the backend's message.
      setPageError(parseError(err).message)
    } finally {
      setDeleteTarget(null)
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
  } else if (!data) {
    body = <Spinner label="Loading companies..." />
  } else if (data.length === 0) {
    body = term ? (
      <EmptyState title="No companies match your search" message="Try a different name." />
    ) : (
      <EmptyState title="No companies yet"
        message="Add a company here, then pick it when you add an application.">
        <button className="btn btn-primary btn-sm" onClick={() => setModal({ company: null })}>
          + Add company
        </button>
      </EmptyState>
    )
  } else {
    body = (
      <div className={loading ? 'table-wrap dim' : 'table-wrap'}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Website</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.industry || '-'}</td>
                <td>{c.location || '-'}</td>
                <td>
                  {c.website ? (
                    <a href={c.website} target="_blank" rel="noopener noreferrer">Open</a>
                  ) : '-'}
                </td>
                <td className="row-actions">
                  <button className="link-btn" onClick={() => setModal({ company: c })}>Edit</button>
                  <button className="link-btn link-danger" onClick={() => setDeleteTarget(c)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>Companies</h1>
          {data && !term && <p className="muted">{data.length} total</p>}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({ company: null })}>
          + Add company
        </button>
      </div>

      <div className="card search-card">
        <div className="form-field">
          <label htmlFor="companySearch">Search</label>
          <input id="companySearch" placeholder="Company name" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <ErrorMessage message={pageError} />
      {notice && <div className="alert alert-info" role="status">{notice}</div>}
      {body}

      {modal && (
        <CompanyForm key={modal.company ? modal.company.id : 'new'} company={modal.company}
          onSaved={handleSaved} onCancel={() => setModal(null)} />
      )}

      {deleteTarget && (
        <ConfirmDialog title="Delete this company?"
          message={`"${deleteTarget.name}" will be removed. Companies that still have applications cannot be deleted.`}
          confirmLabel="Delete" busyLabel="Deleting..." busy={deleting}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  )
}
