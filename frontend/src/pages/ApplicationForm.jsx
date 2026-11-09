import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createApplication, getApplication, updateApplication } from '../api/applicationApi'
import { listCompanies } from '../api/companyApi'
import { parseError } from '../api/axiosClient'
import CompanyPicker from '../components/applications/CompanyPicker'
import FormField from '../components/common/FormField'
import SelectField from '../components/common/SelectField'
import TextAreaField from '../components/common/TextAreaField'
import ErrorMessage from '../components/common/ErrorMessage'
import StatusBadge from '../components/common/StatusBadge'
import Spinner from '../components/common/Spinner'
import { JOB_TYPES, SOURCES, STATUSES, WORK_MODES } from '../utils/constants'
import { EMPTY_FORM, buildPayload, toFormState, validateForm } from '../utils/applicationForm'

export default function ApplicationForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load the company list (and the application itself when editing).
  useEffect(() => {
    let cancelled = false
    const requests = [listCompanies()]
    if (isEdit) requests.push(getApplication(id))

    Promise.all(requests)
      .then(([companyList, application]) => {
        if (cancelled) return
        setCompanies(companyList)
        if (application) setForm(toFormState(application))
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(parseError(err).message)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleCompanyAdded = (company) => {
    setCompanies((list) => [...list, company].sort((a, b) => a.name.localeCompare(b.name)))
    setForm((f) => ({ ...f, companyId: String(company.id) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const found = validateForm(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      const payload = buildPayload(form, isEdit)
      if (isEdit) {
        await updateApplication(id, payload)
      } else {
        await createApplication(payload)
      }
      navigate('/applications')
    } catch (err) {
      const parsed = parseError(err)
      setServerError(parsed.message)
      const fieldErrors = { ...parsed.fieldErrors }
      if (fieldErrors.datesValid) {
        fieldErrors.deadline = fieldErrors.datesValid
        delete fieldErrors.datesValid
      }
      setErrors(fieldErrors)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner label="Loading..." />

  if (loadError) {
    return (
      <div className="card">
        <ErrorMessage message={loadError} />
        <Link to="/applications" className="btn btn-secondary btn-sm">Back to applications</Link>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit application' : 'Add application'}</h1>
      </div>

      <form className="card" onSubmit={handleSubmit} noValidate>
        <ErrorMessage message={serverError} />

        <div className="form-grid">
          <CompanyPicker companies={companies} value={form.companyId} onChange={handleChange}
            error={errors.companyId} onCompanyAdded={handleCompanyAdded} />
          <FormField label="Job title *" name="jobTitle" value={form.jobTitle}
            onChange={handleChange} error={errors.jobTitle} />

          <SelectField label="Job type *" name="jobType" value={form.jobType}
            onChange={handleChange} error={errors.jobType} options={JOB_TYPES}
            placeholder="Select a type" />
          <SelectField label="Work mode" name="workMode" value={form.workMode}
            onChange={handleChange} error={errors.workMode} options={WORK_MODES}
            placeholder="Not specified" />

          <FormField label="Location" name="location" value={form.location}
            onChange={handleChange} error={errors.location} />
          <FormField label="Salary / CTC" name="salary" placeholder="e.g. 6 LPA or 25k/month"
            value={form.salary} onChange={handleChange} error={errors.salary} />

          <FormField label="Applied date" name="appliedDate" type="date" value={form.appliedDate}
            onChange={handleChange} error={errors.appliedDate} />
          <FormField label="Deadline" name="deadline" type="date" value={form.deadline}
            onChange={handleChange} error={errors.deadline} />

          <SelectField label="Source" name="source" value={form.source}
            onChange={handleChange} error={errors.source} options={SOURCES}
            placeholder="Not specified" />
          <FormField label="Resume used" name="resumeUsed" placeholder="e.g. Resume v3"
            value={form.resumeUsed} onChange={handleChange} error={errors.resumeUsed} />

          <div className="span-2">
            <FormField label="Job URL" name="jobUrl" placeholder="https://..."
              value={form.jobUrl} onChange={handleChange} error={errors.jobUrl} />
          </div>

          <div className="span-2">
            {isEdit ? (
              <div className="form-field">
                <label>Current status</label>
                <div>
                  <StatusBadge status={form.status} />
                  <span className="muted small"> Status is changed from the application details page.</span>
                </div>
              </div>
            ) : (
              <SelectField label="Status" name="status" value={form.status}
                onChange={handleChange} error={errors.status} options={STATUSES} />
            )}
          </div>

          <div className="span-2">
            <TextAreaField label="Notes" name="notes" rows={4} value={form.notes}
              onChange={handleChange} error={errors.notes} />
          </div>
        </div>

        <div className="btn-row">
          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add application'}
          </button>
          <Link to="/applications" className="btn btn-secondary btn-sm">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
