import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { fetchMe } from '../api/authApi'
import { parseError } from '../api/axiosClient'
import ErrorMessage from '../components/common/ErrorMessage'

// TEMPORARY placeholder: proves that the token works on a protected API call.
// The real dashboard (stats and charts) is built in Phase 13.
export default function Dashboard() {
  const { user, logout } = useAuth()
  const [serverUser, setServerUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMe()
      .then(setServerUser)
      .catch((err) => setError(parseError(err).message))
  }, [])

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Welcome, {user.fullName}</h1>
        <p className="muted">You are signed in as {user.email}</p>
        <ErrorMessage message={error} />
        {serverUser && (
          <div className="alert alert-info">
            Verified with the server: /api/users/me returned id {serverUser.id}.
          </div>
        )}
        <button className="btn btn-secondary" onClick={logout}>Log out</button>
      </div>
    </div>
  )
}
