import { useState } from 'react'
import FormField from '../common/FormField'
import ErrorMessage from '../common/ErrorMessage'
import { useAuth } from '../../hooks/useAuth'
import { parseError } from '../../api/axiosClient'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(f) {
  const found = {}
  if (!f.fullName.trim()) found.fullName = 'Full name is required'
  else if (f.fullName.trim().length > 100) found.fullName = 'Full name must be at most 100 characters'
  if (!f.email.trim()) found.email = 'Email is required'
  else if (!EMAIL_PATTERN.test(f.email.trim())) found.email = 'Enter a valid email'
  else if (f.email.trim().length > 150) found.email = 'Email must be at most 150 characters'
  return found
}

export default function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ fullName: user.fullName, email: user.email })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const unchanged =
    form.fullName.trim() === user.fullName && form.email.trim().toLowerCase() === user.email

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccess('')
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    try {
      await updateProfile({ fullName: form.fullName.trim(), email: form.email.trim() })
      setSuccess('Profile updated.')
    } catch (err) {
      const parsed = parseError(err)
      setServerError(parsed.message)
      setErrors(parsed.fieldErrors)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>Profile</h2>
      <ErrorMessage message={serverError} />
      {success && <div className="alert alert-success" role="status">{success}</div>}
      <FormField label="Full name" name="fullName" value={form.fullName}
        onChange={handleChange} error={errors.fullName} />
      <FormField label="Email" name="email" type="email" value={form.email}
        onChange={handleChange} error={errors.email} />
      <button type="submit" className="btn btn-primary btn-sm" disabled={saving || unchanged}>
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  )
}
