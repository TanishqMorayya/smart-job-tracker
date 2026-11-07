import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import FormField from '../components/common/FormField'
import ErrorMessage from '../components/common/ErrorMessage'
import { useAuth } from '../hooks/useAuth'
import { parseError } from '../api/axiosClient'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Register() {
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Same rules as the backend (RegisterRequest), so most mistakes are caught before the request.
  const validate = () => {
    const found = {}
    if (!form.fullName.trim()) found.fullName = 'Full name is required'
    if (!form.email.trim()) found.email = 'Email is required'
    else if (!EMAIL_PATTERN.test(form.email.trim())) found.email = 'Enter a valid email'
    if (form.password.length < 8 || form.password.length > 72) {
      found.password = 'Password must be 8 to 72 characters'
    } else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      found.password = 'Password must contain at least one letter and one digit'
    }
    if (form.confirm !== form.password) found.confirm = 'Passwords do not match'
    return found
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/', { replace: true })
    } catch (err) {
      const parsed = parseError(err)
      setServerError(parsed.message)
      setErrors(parsed.fieldErrors)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create account</h1>
        <p className="muted">Start tracking your job applications</p>

        <ErrorMessage message={serverError} />

        <FormField label="Full name" name="fullName" autoComplete="name"
          value={form.fullName} onChange={handleChange} error={errors.fullName} />
        <FormField label="Email" name="email" type="email" autoComplete="email"
          value={form.email} onChange={handleChange} error={errors.email} />
        <FormField label="Password" name="password" type="password" autoComplete="new-password"
          value={form.password} onChange={handleChange} error={errors.password} />
        <FormField label="Confirm password" name="confirm" type="password" autoComplete="new-password"
          value={form.confirm} onChange={handleChange} error={errors.confirm} />

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
        <p className="muted center">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
