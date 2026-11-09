import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { parseError } from '../api/axiosClient'
import FormField from '../components/common/FormField'
import ErrorMessage from '../components/common/ErrorMessage'

// Limits mirror the backend UpdateProfileRequest.
function validate(v) {
  const errors = {}
  const name = v.fullName.trim()
  if (!name) errors.fullName = 'Full name is required'
  else if (name.length > 100) errors.fullName = 'Full name must be at most 100 characters'

  const email = v.email.trim()
  if (!email) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email format is invalid'
  else if (email.length > 150) errors.email = 'Email must be at most 150 characters'
  return errors
}

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [values, setValues] = useState({ fullName: user.fullName, email: user.email })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    setNotice('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setFormError('')
    setNotice('')
    if (Object.keys(found).length > 0) return

    setSaving(true)
    try {
      await updateProfile({ fullName: values.fullName.trim(), email: values.email.trim() })
      setNotice('Profile updated')
    } catch (err) {
      const parsed = parseError(err)
      setErrors(parsed.fieldErrors)
      // 409 (email taken) or a network error has no field errors, so show it on top.
      if (Object.keys(parsed.fieldErrors).length === 0) setFormError(parsed.message)
    } finally {
      setSaving(false)
    }
  }

  const unchanged =
    values.fullName.trim() === user.fullName && values.email.trim().toLowerCase() === user.email

  return (
    <div>
      <div className="page-header">
        <h1>Profile</h1>
        <p className="muted">Update your name and email.</p>
      </div>

      <div className="card profile-card">
        <form onSubmit={handleSubmit} noValidate>
          <ErrorMessage message={formError} />
          {notice && <div className="alert alert-info" role="status">{notice}</div>}
          <FormField label="Full name" name="fullName" value={values.fullName}
            error={errors.fullName} onChange={handleChange} />
          <FormField label="Email" name="email" type="email" value={values.email}
            error={errors.email} onChange={handleChange} />
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving || unchanged}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
