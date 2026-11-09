import { useState } from 'react'
import { createCompany, updateCompany } from '../../api/companyApi'
import { parseError } from '../../api/axiosClient'
import FormField from '../common/FormField'
import ErrorMessage from '../common/ErrorMessage'

// Limits mirror the backend CompanyRequest validation.
function validate(v) {
  const errors = {}
  if (!v.name.trim()) errors.name = 'Company name is required'
  else if (v.name.trim().length > 150) errors.name = 'Company name must be at most 150 characters'

  const website = v.website.trim()
  if (website.length > 255) errors.website = 'Website must be at most 255 characters'
  else if (website && !/^https?:\/\/.+/.test(website)) {
    errors.website = 'Website must start with http:// or https://'
  }

  if (v.industry.trim().length > 100) errors.industry = 'Industry must be at most 100 characters'
  if (v.location.trim().length > 150) errors.location = 'Location must be at most 150 characters'
  return errors
}

export default function CompanyForm({ company, onSaved, onCancel }) {
  const isEdit = Boolean(company)
  const [values, setValues] = useState({
    name: company?.name || '',
    website: company?.website || '',
    industry: company?.industry || '',
    location: company?.location || '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return

    // Empty optional fields are sent as null, not "".
    const payload = {
      name: values.name.trim(),
      website: values.website.trim() || null,
      industry: values.industry.trim() || null,
      location: values.location.trim() || null,
    }

    setSaving(true)
    try {
      if (isEdit) await updateCompany(company.id, payload)
      else await createCompany(payload)
      onSaved(isEdit ? 'Company updated' : 'Company added')
    } catch (err) {
      const parsed = parseError(err)
      setErrors(parsed.fieldErrors)
      // Field errors show under the field. Anything else (409 duplicate, network) shows on top.
      if (Object.keys(parsed.fieldErrors).length === 0) setFormError(parsed.message)
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={saving ? undefined : onCancel}>
      <div className="modal modal-scroll" role="dialog" aria-modal="true"
        onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit company' : 'Add company'}</h3>
        <form onSubmit={handleSubmit} noValidate>
          <ErrorMessage message={formError} />
          <FormField label="Company name *" name="name" value={values.name}
            error={errors.name} onChange={handleChange} autoFocus />
          <FormField label="Website" name="website" value={values.website}
            placeholder="https://example.com" error={errors.website} onChange={handleChange} />
          <FormField label="Industry" name="industry" value={values.industry}
            placeholder="e.g. Software" error={errors.industry} onChange={handleChange} />
          <FormField label="Location" name="location" value={values.location}
            placeholder="e.g. Bengaluru" error={errors.location} onChange={handleChange} />
          <div className="btn-row">
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add company'}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}
              disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
