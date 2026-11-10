import { useEffect, useState } from 'react'
import { deleteCompany, listCompanies } from '../api/companyApi'
import { parseError } from '../api/axiosClient'
import { useDebounce } from '../hooks/useDebounce'
import CompanyFormModal from '../components/companies/CompanyFormModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import EmptyState from '../components/common/EmptyState'
import ErrorMessage from '../components/common/ErrorMessage'
import Spinner from '../components/common/Spinner'

export default function Companies() {
  const [search, setSearch] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ key: '', data: null, error: '' })
  const [modal, setModal] = useState(null) // null = closed, { company } = open (company is null when adding)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const debouncedSearch = useDebounce(search)
  const queryKey = JSON.stringify({ q: debouncedSearch.trim(), reloadCount })

  useEffect(() => {
    let cancelled = false
    const { q } = JSON.parse(queryKey)

    listCompanies(q)
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
  const companies = result.data
  const reload = () => setReloadCount((c) => c + 1)

  const handleSaved = () => {
    setModal(null)
    reload()
  }

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteCompany(toDelete.id)
      setToDelete(null)
      reload()
    } catch (err) {
      // e.g. 409: the company still has applications
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
  } else if (!companies) {
    body = <Spinner label="Loading companies..." />
  } else if (companies.length === 0) {
    body = search.trim() ? (
      <EmptyState title="No companies match your search" message="Try a different name." />
    ) : (
      <EmptyState title="No companies yet"
        message="Add the companies you apply to. You can also add one while creating an application.">
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
            {companies.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.industry || '-'}</td>
                <td>{c.location || '-'}</td>
                <td>
                  {c.website ? (
                    <a href={c.website} target="_blank" rel="noopener noreferrer">Visit</a>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <div className="row-actions">
                    <button className="link-btn" onClick={() => setModal({ company: c })}>Edit</button>
                    <button className="link-btn danger" onClick={() => setToDelete(c)}>Delete</button>
                  </div>
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
          {companies && <p className="muted">{companies.length} shown</p>}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setModal({ company: null })}>
          + Add company
        </button>
      </div>

      <div className="card filters">
        <div className="form-field">
          <label htmlFor="companySearch">Search</label>
          <input id="companySearch" placeholder="Company name" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <ErrorMessage message={deleteError} />
      {body}

      {modal && (
        <CompanyFormModal company={modal.company} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {toDelete && (
        <ConfirmDialog title={`Delete ${toDelete.name}?`}
          message="A company that still has job applications cannot be deleted."
          confirmLabel="Delete" busyLabel="Deleting..." busy={deleting}
          onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
      )}
    </div>
  )
}
