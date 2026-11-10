import { useState } from 'react'
import Modal from '../common/Modal'
import FormField from '../common/FormField'
import ErrorMessage from '../common/ErrorMessage'
import { createCompany, updateCompany } from '../../api/companyApi'
import { parseError } from '../../api/axiosClient'

const EMPTY = { name: '', website: '', industry: '', location: '' }

// Same rules as the backend CompanyRequest.
function validate(f) {
  const found = {}
  if (!f.name.trim()) found.name = 'Company name is required'
  else if (f.name.trim().length > 150) found.name = 'Company name must be at most 150 characters'
  if (f.website.trim() && !/^https?:\/\/.+/.test(f.website.trim())) {
    found.website = 'Website must start with http:// or https://'
  }
  if (f.industry.trim().length > 100) found.industry = 'Industry must be at most 100 characters'
  if (f.location.trim().length > 150) found.location = 'Location must be at most 150 characters'
  return found
}

// `company` is null when adding. The modal is mounted fresh each time, so the initial state is enough.
export default function CompanyFormModal({ company, onClose, onSaved }) {
  const isEdit = Boolean(company)
  const [form, setForm] = useState(() =>
    company
      ? {
          name: company.name,
          website: company.website ?? '',
          industry: company.industry ?? '',
          location: company.location ?? '',
        }
      : EMPTY,
  )
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const payload = {
      name: form.name.trim(),
      website: form.website.trim(),
      industry: form.industry.trim(),
      location: form.location.trim(),
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateCompany(company.id, payload)
      } else {
        await createCompany(payload)
      }
      onSaved()
    } catch (err) {
      const parsed = parseError(err)
      setServerError(parsed.message)
      setErrors(parsed.fieldErrors)
      setSaving(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Edit company' : 'Add company'} onClose={onClose} busy={saving}>
      <form onSubmit={handleSubmit} noValidate>
        <ErrorMessage message={serverError} />
        <FormField label="Company name *" name="name" value={form.name}
          onChange={handleChange} error={errors.name} autoFocus />
        <FormField label="Website" name="website" placeholder="https://..."
          value={form.website} onChange={handleChange} error={errors.website} />
        <FormField label="Industry" name="industry" value={form.industry}
          onChange={handleChange} error={errors.industry} />
        <FormField label="Location" name="location" value={form.location}
          onChange={handleChange} error={errors.location} />
        <div className="btn-row">
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add company'}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={saving}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
