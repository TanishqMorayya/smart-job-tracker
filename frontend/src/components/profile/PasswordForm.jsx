import { useState } from 'react'
import FormField from '../common/FormField'
import ErrorMessage from '../common/ErrorMessage'
import { changePassword } from '../../api/authApi'
import { parseError } from '../../api/axiosClient'

const EMPTY = { currentPassword: '', newPassword: '', confirm: '' }

// Same rules as the backend ChangePasswordRequest.
function validate(f) {
  const found = {}
  if (!f.currentPassword) found.currentPassword = 'Current password is required'
  if (f.newPassword.length < 8 || f.newPassword.length > 72) {
    found.newPassword = 'Password must be 8 to 72 characters'
  } else if (!/[A-Za-z]/.test(f.newPassword) || !/\d/.test(f.newPassword)) {
    found.newPassword = 'Password must contain at least one letter and one digit'
  } else if (f.newPassword === f.currentPassword) {
    found.newPassword = 'New password must be different from the current password'
  }
  if (f.confirm !== f.newPassword) found.confirm = 'Passwords do not match'
  return found
}

export default function PasswordForm() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

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
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setForm(EMPTY)
      setSuccess('Password changed. Use the new password the next time you sign in.')
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
      <h2>Change password</h2>
      <ErrorMessage message={serverError} />
      {success && <div className="alert alert-success" role="status">{success}</div>}
      <FormField label="Current password" name="currentPassword" type="password"
        autoComplete="current-password" value={form.currentPassword}
        onChange={handleChange} error={errors.currentPassword} />
      <FormField label="New password" name="newPassword" type="password"
        autoComplete="new-password" value={form.newPassword}
        onChange={handleChange} error={errors.newPassword} />
      <FormField label="Confirm new password" name="confirm" type="password"
        autoComplete="new-password" value={form.confirm}
        onChange={handleChange} error={errors.confirm} />
      <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
        {saving ? 'Changing...' : 'Change password'}
      </button>
    </form>
  )
}
