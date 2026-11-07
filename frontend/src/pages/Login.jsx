import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import FormField from '../components/common/FormField'
import ErrorMessage from '../components/common/ErrorMessage'
import { useAuth } from '../hooks/useAuth'
import { parseError } from '../api/axiosClient'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const found = {}
    if (!form.email.trim()) found.email = 'Email is required'
    else if (!EMAIL_PATTERN.test(form.email.trim())) found.email = 'Enter a valid email'
    if (!form.password) found.password = 'Password is required'
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
      await login({ email: form.email.trim(), password: form.password })
      navigate(location.state?.from?.pathname || '/', { replace: true })
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
        <h1>Smart Job Tracker</h1>
        <p className="muted">Sign in to manage your applications</p>

        {params.get('expired') && (
          <div className="alert alert-info">Your session expired. Please sign in again.</div>
        )}
        <ErrorMessage message={serverError} />

        <FormField label="Email" name="email" type="email" autoComplete="email"
          value={form.email} onChange={handleChange} error={errors.email} />
        <FormField label="Password" name="password" type="password" autoComplete="current-password"
          value={form.password} onChange={handleChange} error={errors.password} />

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="muted center">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  )
}
